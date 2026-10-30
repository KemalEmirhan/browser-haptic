/// <reference path="./bun-test.d.ts" />
import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import {
  hasVibration,
  isSupported,
  vibrate,
  light,
  medium,
  heavy,
  success,
  warning,
  error,
  default as Haptic,
} from "../src/haptic";

type NavigatorLike = {
  vibrate: ((pattern: number | number[]) => boolean) | null;
  userAgent?: string;
};
type DocumentLike = { body: unknown } | undefined;
type VibrateMock = {
  (pattern: number | number[]): boolean;
  toHaveBeenCalledTimes(n: number): void;
  toHaveBeenCalledWith(...args: unknown[]): void;
};

const _global = (): { navigator: NavigatorLike | undefined; document: DocumentLike } =>
  globalThis as unknown as { navigator: NavigatorLike | undefined; document: DocumentLike };

const setGlobals = (nav: NavigatorLike | undefined, doc: DocumentLike): void => {
  const global = _global();
  global.navigator = nav;
  global.document = doc;
};

const createVibrateMock = (): VibrateMock => mock(() => true) as VibrateMock;

const withVibrationApi = (): VibrateMock => {
  const vibrateMock = createVibrateMock();
  setGlobals({ vibrate: vibrateMock }, undefined);
  return vibrateMock;
};


const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const IPAD_UA =
  "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const DESKTOP_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";

type Listener = (event: { stopPropagation(): void }) => void;

/**
 * Minimal DOM stand-in. A label click runs the label's own listeners, then the
 * input's change listeners, and bubbles each event to `document` unless a
 * listener called stopPropagation.
 */
const createFakeDom = () => {
  const documentListeners: Record<string, Listener[]> = {};
  const appended: unknown[] = [];
  const clicks = { count: 0 };

  const createNode = (tag: string) => {
    const listeners: Record<string, Listener[]> = {};
    const children: ReturnType<typeof createNode>[] = [];
    const dispatch = (type: string, own: Record<string, Listener[]>) => {
      let stopped = false;
      const event = { stopPropagation: () => { stopped = true; } };
      for (const l of own[type] ?? []) l(event);
      if (!stopped) for (const l of documentListeners[type] ?? []) l(event);
    };
    const node = {
      tag,
      type: "",
      style: { cssText: "" },
      setAttribute: () => {},
      addEventListener: (type: string, l: Listener) => {
        (listeners[type] ??= []).push(l);
      },
      appendChild: (child: ReturnType<typeof createNode>) => {
        children.push(child);
      },
      click: () => {
        clicks.count++;
        dispatch("click", listeners);
        for (const child of children) dispatch("change", child.listeners);
      },
      listeners,
    };
    return node;
  };

  const doc = {
    body: {
      appendChild: (n: unknown) => { appended.push(n); },
      removeChild: () => {},
    },
    createElement: createNode,
    addEventListener: (type: string, l: Listener) => {
      (documentListeners[type] ??= []).push(l);
    },
  };
  return { doc, appended, clicks };
};

class FakeSwitchInput {}
(FakeSwitchInput.prototype as unknown as { switch: boolean }).switch = false;
class FakePlainInput {}

const setInputClass = (cls: unknown): void => {
  (globalThis as unknown as { HTMLInputElement: unknown }).HTMLInputElement = cls;
};

/** iPhone Safari 17.4+: no Vibration API, switch input supported. */
const withIPhone = (ua = IPHONE_UA, inputClass: unknown = FakeSwitchInput) => {
  const dom = createFakeDom();
  setGlobals({ vibrate: null, userAgent: ua }, dom.doc as unknown as DocumentLike);
  setInputClass(inputClass);
  return dom;
};

const PRESET_CASES: [string, () => void, number | number[]][] = [
  ["light", light, 15],
  ["medium", medium, 25],
  ["heavy", heavy, 40],
  ["success", success, [15, 60, 25]],
  ["warning", warning, [25, 80, 25]],
  ["error", error, [40, 60, 40, 60, 40]],
];

const PRESET_FNS: [string, () => void][] = PRESET_CASES.map(([name, fn]) => [name, fn]);

const HAPTIC_METHODS = [
  "hasVibration",
  "isSupported",
  "vibrate",
  "light",
  "medium",
  "heavy",
  "success",
  "warning",
  "error",
] as const satisfies readonly (keyof typeof Haptic)[];

describe("haptic", () => {
  const originalNavigator = _global().navigator;
  const originalDocument = _global().document;
  const originalInput = (globalThis as unknown as { HTMLInputElement: unknown }).HTMLInputElement;

  afterEach(() => {
    setGlobals(originalNavigator, originalDocument);
    setInputClass(originalInput);
  });

  describe("hasVibration", () => {
    test.each<[boolean, string, NavigatorLike | undefined]>([
      [false, "navigator undefined", undefined],
      [false, "vibrate is null", { vibrate: null }],
      [true, "vibrate is function", { vibrate: () => true }],
    ])("returns %s when %s", (expected, _label, nav) => {
      setGlobals(nav, undefined);
      expect(hasVibration()).toBe(expected);
    });
  });

  describe("isSupported", () => {
    test.each<[boolean, string, NavigatorLike | undefined, DocumentLike]>([
      [false, "navigator undefined", undefined, { body: {} }],
      [false, "document undefined", { vibrate: null }, undefined],
      [true, "navigator.vibrate exists", { vibrate: () => true }, { body: {} }],
    ])("returns %s when %s", (expected, _label, nav, doc) => {
      setGlobals(nav, doc);
      expect(isSupported()).toBe(expected);
    });

    test.each<[boolean, string, string, unknown]>([
      [true, "iPhone with switch input", IPHONE_UA, FakeSwitchInput],
      [false, "iPhone without switch input (iOS < 17.4)", IPHONE_UA, FakePlainInput],
      [false, "iPad (no Taptic Engine)", IPAD_UA, FakeSwitchInput],
      [false, "desktop Safari without vibrate", DESKTOP_SAFARI_UA, FakeSwitchInput],
    ])("returns %s on %s", (expected, _label, ua, inputClass) => {
      withIPhone(ua, inputClass);
      expect(isSupported()).toBe(expected);
    });
  });

  describe("with Vibration API", () => {
    let vibrateMock: VibrateMock;

    beforeEach(() => {
      vibrateMock = withVibrationApi();
    });

    describe("vibrate", () => {
      test("calls navigator.vibrate with number", () => {
        vibrate(50);
        expect(vibrateMock).toHaveBeenCalledTimes(1);
        expect(vibrateMock).toHaveBeenCalledWith(50);
      });

      test("calls navigator.vibrate with array pattern", () => {
        vibrate([10, 50, 10]);
        expect(vibrateMock).toHaveBeenCalledTimes(1);
        expect(vibrateMock).toHaveBeenCalledWith([10, 50, 10]);
      });
    });

    test.each(PRESET_CASES)("%s calls vibrate with expected pattern", (_name, trigger, expected) => {
      trigger();
      expect(vibrateMock).toHaveBeenCalledWith(expected);
    });

    test("on Android uses the same short presets as other browsers", () => {
      const vibrateMock = createVibrateMock();
      setGlobals(
        { vibrate: vibrateMock, userAgent: "Mozilla/5.0 (Linux; Android 14) ..." },
        undefined,
      );
      light();
      expect(vibrateMock).toHaveBeenNthCalledWith(1, 15);
      success();
      expect(vibrateMock).toHaveBeenNthCalledWith(2, [15, 60, 25]);
    });

    test.each(PRESET_CASES.filter(([, , p]) => typeof p === "number"))(
      "%s is a single tap of at most 50ms",
      (_name, _fn, pattern) => {
        expect(pattern as number).toBeLessThanOrEqual(50);
      },
    );

    test.each(PRESET_CASES)("%s pattern lasts at most 300ms in total", (_name, trigger) => {
      trigger();
      const sent = (vibrateMock as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]![0];
      const total = ([] as number[]).concat(sent as number | number[]).reduce((a, b) => a + b, 0);
      expect(total).toBeLessThanOrEqual(300);
    });
  });

  test("vibrate does not throw when vibrate API throws", () => {
    setGlobals({ vibrate: () => { throw new Error("blocked"); } }, undefined);
    expect(() => vibrate(10)).not.toThrow();
  });

  describe("when unsupported", () => {
    beforeEach(() => setGlobals(undefined, undefined));

    test("vibrate(number) and vibrate(array) do not throw", () => {
      expect(() => vibrate(10)).not.toThrow();
      expect(() => vibrate([10, 50, 10])).not.toThrow();
    });

    test.each(PRESET_FNS)("%s does not throw", (_name, fn) => {
      expect(() => fn()).not.toThrow();
    });
  });

  describe("iOS switch fallback (no Vibration API, with DOM)", () => {
    const flush = () => new Promise((r) => setTimeout(r, 50));

    test("toggles a hidden switch on iPhone", async () => {
      const dom = withIPhone();
      vibrate(10);
      await flush();
      expect(dom.appended.length).toBe(1);
      expect(dom.clicks.count).toBe(1);
    });

    test.each<[string, string]>([
      ["desktop Safari", DESKTOP_SAFARI_UA],
      ["iPad", IPAD_UA],
    ])("does nothing on %s", async (_label, ua) => {
      const dom = withIPhone(ua);
      success();
      await flush();
      expect(dom.appended.length).toBe(0);
      expect(dom.clicks.count).toBe(0);
    });

    test("click and change events do not bubble to document", async () => {
      const dom = withIPhone();
      const onClick = mock(() => {});
      const onChange = mock(() => {});
      dom.doc.addEventListener("click", onClick);
      dom.doc.addEventListener("change", onChange);
      light();
      await flush();
      expect(dom.clicks.count).toBeGreaterThan(0);
      expect(onClick).toHaveBeenCalledTimes(0);
      expect(onChange).toHaveBeenCalledTimes(0);
    });

    test("does not throw when DOM ops throw", async () => {
      withIPhone();
      _global().document = {
        body: {},
        createElement: () => {
          throw new Error("createElement blocked");
        },
      } as unknown as DocumentLike;
      expect(() => vibrate(10)).not.toThrow();
      await flush();
    });
  });

  describe("default export (Haptic)", () => {
    test.each(HAPTIC_METHODS.map((name) => [name]))("has method %s", (name) => {
      expect(typeof Haptic[name]).toBe("function");
    });

    test("delegates to same implementation as named exports", () => {
      const vibrateMock = withVibrationApi();
      Haptic.light();
      expect(vibrateMock).toHaveBeenCalledWith(15);
    });
  });
});
