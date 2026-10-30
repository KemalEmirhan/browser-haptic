import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { Window } from "happy-dom";
import { attach, HapticPreset, default as Haptic } from "../src/haptic";

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36";
const DESKTOP_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";

const GLOBAL_KEYS = ["window", "document", "navigator", "HTMLInputElement", "MouseEvent", "getComputedStyle"] as const;
type Globals = Record<(typeof GLOBAL_KEYS)[number], unknown>;
const g = globalThis as unknown as Globals;

let win: Window;
let doc: Window["document"];
let saved: Partial<Globals>;

/** Installs a happy-dom window as the global DOM, posing as the given browser. */
const useBrowser = (ua: string, { vibrate = false, switchInput = false } = {}) => {
  win = new Window();
  doc = win.document;
  if (switchInput) {
    Object.defineProperty(win.HTMLInputElement.prototype, "switch", { value: false, configurable: true });
  }
  const vibrateMock = mock(() => true);
  const nav = { userAgent: ua, vibrate: vibrate ? vibrateMock : undefined };
  g.window = win;
  g.document = doc;
  g.navigator = nav;
  g.HTMLInputElement = win.HTMLInputElement;
  g.MouseEvent = win.MouseEvent;
  g.getComputedStyle = win.getComputedStyle.bind(win);
  return vibrateMock;
};

const useIPhone = () => useBrowser(IPHONE_UA, { switchInput: true });

const button = (html = "<button>Tap</button>"): HTMLElement => {
  doc.body.innerHTML = html;
  return doc.body.firstElementChild as unknown as HTMLElement;
};

/** The tap target: a label covering the element, tied to a hidden switch. */
const overlayOf = (el: HTMLElement) => el.querySelector("label") as HTMLLabelElement | null;
const switchOf = (el: HTMLElement) => el.querySelector("input[switch]") as HTMLInputElement | null;

beforeEach(() => {
  saved = {};
  for (const k of GLOBAL_KEYS) saved[k] = g[k];
});

afterEach(() => {
  for (const k of GLOBAL_KEYS) g[k] = saved[k];
  win?.close();
});

describe("attach on iPhone (overlay)", () => {
  beforeEach(useIPhone);

  test("covers the element with a label tied to a hidden switch", () => {
    const el = button();
    attach(el);
    const cover = overlayOf(el)!;
    const sw = switchOf(el)!;
    expect(cover.getAttribute("aria-hidden")).toBe("true");
    expect(cover.style.position).toBe("absolute");
    expect(cover.style.opacity).toBe("0");
    expect(sw.parentElement).toBe(cover as never);
    expect(sw.type).toBe("checkbox");
    expect(sw.tabIndex).toBe(-1);
  });

  test("a tap on the cover really toggles the switch", () => {
    const el = button();
    attach(el);
    expect(switchOf(el)!.checked).toBe(false);
    overlayOf(el)!.click();
    expect(switchOf(el)!.checked).toBe(true);
  });

  test("makes a static element relative and restores it on cleanup", () => {
    const el = button();
    const detach = attach(el);
    expect(el.style.position).toBe("relative");
    detach();
    expect(el.style.position).toBe("");
    expect(overlayOf(el)).toBeNull();
  });

  test("keeps an element that is already positioned", () => {
    const el = button('<button style="position:absolute">Tap</button>');
    attach(el);
    expect(el.style.position).toBe("absolute");
  });

  test("a tap on the overlay reaches the element's click handlers exactly once", () => {
    const el = button();
    const onEl = mock(() => {});
    const onDoc = mock(() => {});
    el.addEventListener("click", onEl);
    doc.addEventListener("click", onDoc);
    attach(el);
    overlayOf(el)!.click();
    expect(onEl).toHaveBeenCalledTimes(1);
    expect(onDoc).toHaveBeenCalledTimes(1);
  });

  test("the forwarded click targets the element, not the overlay", () => {
    const el = button();
    let target: unknown = null;
    doc.addEventListener("click", (e) => { target = e.target; });
    attach(el);
    overlayOf(el)!.click();
    expect(target).toBe(el);
  });

  test("the overlay's change event does not bubble", () => {
    const el = button();
    const onChange = mock(() => {});
    doc.addEventListener("change", onChange);
    attach(el);
    overlayOf(el)!.click();
    expect(onChange).toHaveBeenCalledTimes(0);
  });

  test("a submit button still submits its form once", () => {
    doc.body.innerHTML = '<form><button type="submit">Send</button></form>';
    const form = doc.querySelector("form")!;
    const el = doc.querySelector("button") as unknown as HTMLElement;
    const onSubmit = mock((e: Event) => e.preventDefault());
    form.addEventListener("submit", onSubmit as never);
    attach(el);
    overlayOf(el)!.click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("does not move focus on tap, like a native iOS tap", () => {
    const el = button();
    attach(el);
    overlayOf(el)!.click();
    expect(doc.activeElement).not.toBe(el as never);
  });

  test("does nothing on a disabled button: no click, no toggle", () => {
    const el = button("<button disabled>Tap</button>");
    const onDoc = mock(() => {});
    doc.addEventListener("click", onDoc);
    attach(el);
    overlayOf(el)!.click();
    expect(onDoc).toHaveBeenCalledTimes(0);
    expect(switchOf(el)!.checked).toBe(false);
  });

  test("is idempotent: a second attach adds nothing and returns a no-op", () => {
    const el = button();
    const detach = attach(el);
    const second = attach(el);
    expect(el.querySelectorAll("label").length).toBe(1);
    second();
    expect(overlayOf(el)).not.toBeNull();
    detach();
    expect(overlayOf(el)).toBeNull();
  });

  test("can attach again after cleanup", () => {
    const el = button();
    attach(el)();
    attach(el);
    expect(el.querySelectorAll("label").length).toBe(1);
  });
});

describe("attach with the Vibration API", () => {
  test("vibrates with the preset on click, light by default", () => {
    const vibrate = useBrowser(ANDROID_UA, { vibrate: true });
    const a = button();
    const b = doc.createElement("button") as unknown as HTMLElement;
    doc.body.appendChild(b as never);
    attach(a);
    attach(b, HapticPreset.Success);
    a.click();
    b.click();
    expect(vibrate).toHaveBeenNthCalledWith(1, 15);
    expect(vibrate).toHaveBeenNthCalledWith(2, [15, 60, 25]);
  });

  test("accepts preset names as strings", () => {
    const vibrate = useBrowser(ANDROID_UA, { vibrate: true });
    const el = button();
    attach(el, "heavy");
    el.click();
    expect(vibrate).toHaveBeenCalledWith(40);
  });

  test("adds no overlay, and cleanup stops the vibration", () => {
    const vibrate = useBrowser(ANDROID_UA, { vibrate: true });
    const el = button();
    const detach = attach(el);
    expect(overlayOf(el)).toBeNull();
    detach();
    el.click();
    expect(vibrate).toHaveBeenCalledTimes(0);
  });

  test("is idempotent", () => {
    const vibrate = useBrowser(ANDROID_UA, { vibrate: true });
    const el = button();
    attach(el);
    attach(el);
    el.click();
    expect(vibrate).toHaveBeenCalledTimes(1);
  });
});

describe("attach where haptics are unavailable", () => {
  test("does nothing on desktop Safari", () => {
    useBrowser(DESKTOP_SAFARI_UA, { switchInput: true });
    const el = button();
    const detach = attach(el);
    expect(el.children.length).toBe(0);
    expect(el.style.position).toBe("");
    expect(() => detach()).not.toThrow();
  });

  test("does not throw without a DOM (SSR)", () => {
    g.document = undefined;
    g.navigator = undefined;
    const detach = attach({} as HTMLElement);
    expect(() => detach()).not.toThrow();
  });

  test("is on the default export", () => {
    expect(Haptic.attach).toBe(attach);
  });
});
