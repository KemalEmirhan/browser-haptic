/**
 * # browser-haptic
 *
 * Lightweight haptic feedback for web apps. Triggers tactile feedback on supported devices
 * so users get a physical response when they tap buttons, confirm actions, or hit errors.
 *
 * ## How it works
 *
 * - **Android & supported desktop:** Uses the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
 *   (`navigator.vibrate`) to run vibration patterns you define.
 * - **iPhone, Safari 17.4+:** The Vibration API is not available. This module toggles a hidden
 *   `input[switch]` element once; iOS plays its native switch tick. Best effort only: it must run
 *   synchronously inside a tap handler, it is always a single tick, and iOS 26.5+ may ignore it.
 *
 * If the environment doesn’t support either (e.g. old browsers or SSR), all functions no-op
 * and never throw.
 *
 * @module haptic
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
 */

/**
 * Describes a single vibration or a pattern of vibrations and pauses.
 *
 * - **Single number:** Vibration duration in milliseconds (e.g. `50` = vibrate for 50ms).
 * - **Array:** Alternating [vibrate, pause, vibrate, pause, ...] in milliseconds.
 *   Example: `[10, 50, 10]` = vibrate 10ms, pause 50ms, vibrate 10ms (double tap).
 */
export type VibrationPattern = number | number[] | readonly number[];

/** Haptic preset variant. Use with presets Map for type-safe lookups. */
export enum HapticPreset {
  Light = "light",
  Medium = "medium",
  Heavy = "heavy",
  Success = "success",
  Warning = "warning",
  Error = "error",
}

/** A preset as an enum value or its string name, e.g. `HapticPreset.Success` or `"success"`. */
export type HapticPresetName = HapticPreset | `${HapticPreset}`;

/**
 * Type of the default export: an object with all haptic methods.
 * Use this when you need to type a variable that holds the default import.
 *
 * @example
 * import Haptic, { type Haptic } from "browser-haptic";
 * const feedback: Haptic = Haptic;
 */
export interface Haptic {
  attach(el: HTMLElement, preset?: HapticPresetName): () => void;
  hasVibration(): boolean;
  isReliable(): boolean;
  isSupported(): boolean;
  vibrate(pattern: VibrationPattern): void;
  light(): void;
  medium(): void;
  heavy(): void;
  success(): void;
  warning(): void;
  error(): void;
}

/**
 * Presets for the Vibration API. Short pulses so a "light" tap feels like a tap, not a buzz.
 * Single taps stay at or under 50ms and no pattern lasts longer than 300ms.
 */
const VIBRATION_PRESETS = new Map<HapticPreset, number | number[]>([
  [HapticPreset.Light, 15],
  [HapticPreset.Medium, 25],
  [HapticPreset.Heavy, 40],
  [HapticPreset.Success, [15, 60, 25]],
  [HapticPreset.Warning, [25, 80, 25]],
  [HapticPreset.Error, [40, 60, 40, 60, 40]],
]);

const getPreset = (variant: HapticPresetName): VibrationPattern =>
  VIBRATION_PRESETS.get(variant as HapticPreset) ?? VIBRATION_PRESETS.get(HapticPreset.Light)!;

const hasVibrationAPI = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

const hasDOM = (): boolean =>
  typeof document !== "undefined" && !!document.body;

/** iPhone or iPod. iPads are left out on purpose: they have no Taptic Engine. */
const isIPhone = (): boolean =>
  typeof navigator !== "undefined" && /iPhone|iPod/.test(navigator.userAgent ?? "");

/** True when `<input type="checkbox" switch>` is supported (Safari 17.4+). */
const hasSwitchControl = (): boolean =>
  typeof HTMLInputElement !== "undefined" && "switch" in HTMLInputElement.prototype;

/** The hidden-switch path only runs where it can buzz: an iPhone with switch support. */
const canUseIOSSwitch = (): boolean => isIPhone() && hasSwitchControl() && hasDOM();

const stopEvent = (event: Event): void => event.stopPropagation();

const fireIOSSwitch = (): void => {
  if (!hasDOM()) return;
  try {
    const label = document.createElement("label");
    label.setAttribute("aria-hidden", "true");
    label.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.addEventListener("click", stopEvent);
    input.addEventListener("change", stopEvent);
    label.appendChild(input);
    document.body.appendChild(label);
    label.click();
    document.body.removeChild(label);
  } catch {
    // no-op
  }
};

const toPatternArray = (pattern: VibrationPattern): number[] =>
  (Array.isArray(pattern) ? [...pattern] : [pattern]) as number[];

const trigger = (pattern: VibrationPattern): void => {
  if (hasVibrationAPI()) {
    try {
      const normalized = toPatternArray(pattern);
      const payload: number | number[] =
        normalized.length === 1 ? normalized[0]! : normalized;
      navigator.vibrate(payload);
    } catch {
      // no-op
    }
    return;
  }

  // iOS: one tick, right now. A timer would leave the user gesture, and iOS drops the haptic.
  if (canUseIOSSwitch()) fireIOSSwitch();
};

/**
 * Checks whether the **Vibration API** is available on this environment.
 *
 * Returns `true` on Android and some desktop browsers that support
 * `navigator.vibrate`. Returns `false` on iOS Safari (which doesn’t implement
 * the Vibration API); on iOS you can still use the other functions: they will
 * use the switch-based fallback when this returns `false`.
 *
 * @returns `true` if `navigator.vibrate` is a function, otherwise `false`
 *
 * @example
 * if (hasVibration()) {
 *   console.log("Using device vibration");
 * } else {
 *   console.log("Using iOS switch fallback or no feedback");
 * }
 */
export const hasVibration = (): boolean => hasVibrationAPI();

/**
 * Checks whether feedback is **guaranteed** to run when called.
 *
 * Returns `true` only when the Vibration API exists. On iPhone the switch tick
 * is best effort: iOS may ignore it (for example on iOS 26.5+, or when called
 * outside a tap handler) and there is no way to detect that.
 *
 * @returns `true` if `navigator.vibrate` is a function, otherwise `false`
 */
export const isReliable = (): boolean => hasVibrationAPI();

/**
 * Checks whether **any** haptic feedback can be triggered in this environment.
 *
 * Returns `true` if the Vibration API is available, or on an iPhone with
 * Safari 17.4+ (where the hidden switch fallback runs). Returns `false` on
 * desktop Safari, desktop Firefox and iPads, where nothing would happen. Use this to decide whether
 * to show “haptic” UI or to call the feedback functions at all. In SSR or
 * unsupported environments this returns `false` and all feedback calls no-op.
 *
 * @returns `true` when feedback can be triggered, `false` when it will be a no-op
 *
 * @example
 * if (isSupported()) {
 *   light(); // will do something
 * } else {
 *   // optional: show a message or skip haptic-only UI
 * }
 */
export const isSupported = (): boolean => {
  if (typeof navigator === "undefined" || typeof document === "undefined") return false;
  return hasVibrationAPI() || canUseIOSSwitch();
};

/**
 * Triggers a custom haptic pattern.
 *
 * Use this when the preset patterns (light, success, error, etc.) aren’t enough.
 * On Vibration API devices the pattern is passed through to `navigator.vibrate`.
 * On iPhone any pattern becomes a single switch tick.
 *
 * @param pattern - Either a single duration in ms, or an array of
 *   [vibrate, pause, vibrate, pause, ...] in ms.
 * @returns Nothing. Never throws; unsupported environments no-op.
 *
 * @example
 * vibrate(100);                    // one 100ms vibration
 * vibrate([10, 50, 10]);            // double tap
 * vibrate([20, 40, 20, 40, 20]);    // triple tap with short gaps
 */
export const vibrate = (pattern: VibrationPattern): void => trigger(pattern);

/**
 * Triggers a short, light tap.
 *
 * Best for subtle feedback: selection changes, toggles, or gentle confirmation.
 * On Vibration API: 15ms. On iPhone: one tick.
 */
export const light = (): void => trigger(getPreset(HapticPreset.Light));

/**
 * Triggers a medium-strength tap.
 *
 * Good for standard button presses and list item taps.
 * On Vibration API: 25ms. On iPhone: one tick.
 */
export const medium = (): void => trigger(getPreset(HapticPreset.Medium));

/**
 * Triggers a strong tap.
 *
 * Use for important actions (e.g. submit, delete) where you want a more
 * noticeable response. On Vibration API: 40ms. On iPhone: one tick.
 */
export const heavy = (): void => trigger(getPreset(HapticPreset.Heavy));

/**
 * Triggers a double-tap pattern (short, pause, short).
 *
 * Suggests “success” or “done”, e.g. after saving, completing a step, or
 * confirming a choice.
 */
export const success = (): void => trigger(getPreset(HapticPreset.Success));

/**
 * Triggers a double-tap pattern with stronger pulses.
 *
 * Suggests “warning” or “attention”, e.g. before a destructive action or when
 * something needs the user’s notice.
 */
export const warning = (): void => trigger(getPreset(HapticPreset.Warning));

/**
 * Triggers a longer, more urgent pattern (five pulses).
 *
 * Use for errors, failures, or critical alerts where you want the user to
 * clearly notice the feedback.
 */
export const error = (): void => trigger(getPreset(HapticPreset.Error));

const attached = new WeakMap<HTMLElement, () => void>();
const noop = (): void => {};

const isDisabled = (el: HTMLElement): boolean => {
  try {
    return el.matches(":disabled");
  } catch {
    return false;
  }
};

/** Android and other Vibration API browsers: vibrate on every click of the element. */
const attachVibration = (el: HTMLElement, preset: HapticPresetName): (() => void) => {
  const onClick = (): void => trigger(getPreset(preset));
  el.addEventListener("click", onClick);
  return () => el.removeEventListener("click", onClick);
};

/**
 * iPhone: put an invisible native switch on top of the element. The user's finger toggles
 * it for real, so iOS plays the switch tick even where script-triggered toggles are silent
 * (iOS 26.5+). The tap is then forwarded to the element as a click, so the app's own
 * handlers, form submits and links still work.
 *
 * Based on `attachIOSOverlay` from https://github.com/howdoiusekeyboard/haptics (MIT).
 */
const attachOverlay = (el: HTMLElement): (() => void) => {
  const previousPosition = el.style.position;
  const position = getComputedStyle(el).position;
  if (!["relative", "absolute", "fixed", "sticky"].includes(position)) {
    el.style.position = "relative";
  }

  const sw = document.createElement("input");
  sw.type = "checkbox";
  sw.setAttribute("switch", "");
  sw.setAttribute("aria-hidden", "true");
  sw.tabIndex = -1;
  sw.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;cursor:inherit;";

  const onClick = (event: Event): void => {
    event.stopPropagation();
    if (isDisabled(el)) return;
    el.focus({ preventScroll: true });
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  };
  sw.addEventListener("click", onClick);
  sw.addEventListener("change", stopEvent);
  el.appendChild(sw);

  return () => {
    sw.removeEventListener("click", onClick);
    sw.removeEventListener("change", stopEvent);
    sw.remove();
    el.style.position = previousPosition;
  };
};

/**
 * Adds haptic feedback to every tap on an element. **The recommended way to get haptics on iPhone.**
 *
 * - **Android / Vibration API:** vibrates with `preset` on each click.
 * - **iPhone, Safari 17.4+:** covers the element with an invisible native switch, so the
 *   user's own tap plays the iOS switch tick (one tick, `preset` is ignored). Works on iOS 26.5+,
 *   where `light()` and the other functions are silent. Clicks are forwarded to the element.
 * - **Anywhere else, or during SSR:** does nothing.
 *
 * Calling it twice on the same element does nothing the second time.
 *
 * @param el - The element to add feedback to, usually a button or link.
 * @param preset - Vibration preset for Vibration API devices. Defaults to `"light"`.
 * @returns A cleanup function that removes the feedback.
 *
 * @example
 * const detach = attach(document.querySelector("#save")!, "success");
 * // later
 * detach();
 */
export const attach = (el: HTMLElement, preset: HapticPresetName = HapticPreset.Light): (() => void) => {
  if (!hasDOM() || attached.has(el)) return noop;

  let detach: () => void;
  try {
    if (hasVibrationAPI()) detach = attachVibration(el, preset);
    else if (canUseIOSSwitch()) detach = attachOverlay(el);
    else return noop;
  } catch {
    return noop;
  }

  attached.set(el, detach);
  return () => {
    if (attached.get(el) !== detach) return;
    attached.delete(el);
    detach();
  };
};

const Haptic: Haptic = {
  attach,
  hasVibration,
  isReliable,
  isSupported,
  vibrate,
  light,
  medium,
  heavy,
  success,
  warning,
  error,
};

/**
 * Default export: use as `Haptic` for a clear, namespace-style API.
 *
 * @example
 * import Haptic from "browser-haptic";
 *
 * const App = () => {
 *   const supported = Haptic.isSupported();
 *   return (
 *     <button onClick={() => Haptic.heavy()}>
 *       Tap me
 *     </button>
 *   );
 * };
 */
export default Haptic;
