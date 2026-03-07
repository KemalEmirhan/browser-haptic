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

const PRESET_CASES: [string, () => void, number | number[]][] = [
  ["light", light, 30],
  ["medium", medium, 50],
  ["heavy", heavy, 80],
  ["success", success, [20, 50, 20]],
  ["warning", warning, [40, 30, 40]],
  ["error", error, [50, 30, 50, 30, 50]],
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

  afterEach(() => setGlobals(originalNavigator, originalDocument));

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
      [true, "document.body exists", { vibrate: null }, { body: {} }],
    ])("returns %s when %s", (expected, _label, nav, doc) => {
      setGlobals(nav, doc);
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

    test("on Android uses longer minimal presets (400–500ms) so vibration is noticeable", () => {
      const vibrateMock = createVibrateMock();
      setGlobals(
        { vibrate: vibrateMock, userAgent: "Mozilla/5.0 (Linux; Android 14) ..." },
        undefined,
      );
      light();
      expect(vibrateMock).toHaveBeenNthCalledWith(1, 400);
      success();
      expect(vibrateMock).toHaveBeenNthCalledWith(2, [400, 80, 400]);
      heavy();
      expect(vibrateMock).toHaveBeenNthCalledWith(3, 500);
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
    test("trigger calls fireIOSSwitch via setTimeout when document.body exists", async () => {
      const appendChild = mock(() => {});
      const removeChild = mock(() => {});
      const click = mock(() => {});
      const mockInput = { type: "", setAttribute: () => {} };
      const mockLabel = {
        setAttribute: () => {},
        style: { cssText: "" },
        appendChild: () => {},
        click: click as () => void,
        removeChild: () => {},
      };
      const createElement = mock((...args: unknown[]) => (args[0] === "label" ? mockLabel : mockInput));
      const body = { appendChild: appendChild as (node: unknown) => void, removeChild: removeChild as (node: unknown) => void };
      const doc = { body, createElement };
      setGlobals({ vibrate: null }, doc as unknown as DocumentLike);
      vibrate(10);
      await new Promise((r) => setTimeout(r, 50));
      expect(createElement).toHaveBeenCalledWith("label");
      expect(createElement).toHaveBeenCalledWith("input");
      expect(appendChild).toHaveBeenCalledWith(mockLabel);
      expect(removeChild).toHaveBeenCalledWith(mockLabel);
      expect(click).toHaveBeenCalledWith();
    });

    test("fireIOSSwitch catch block does not throw when DOM ops throw", async () => {
      const doc = {
        body: {},
        createElement: () => {
          throw new Error("createElement blocked");
        },
      };
      setGlobals({ vibrate: null }, doc as unknown as DocumentLike);
      vibrate(10);
      await new Promise((r) => setTimeout(r, 50));
    });
  });

  describe("default export (Haptic)", () => {
    test.each(HAPTIC_METHODS.map((name) => [name]))("has method %s", (name) => {
      expect(typeof Haptic[name]).toBe("function");
    });

    test("delegates to same implementation as named exports", () => {
      const vibrateMock = withVibrationApi();
      Haptic.light();
      expect(vibrateMock).toHaveBeenCalledWith(30);
    });
  });
});
