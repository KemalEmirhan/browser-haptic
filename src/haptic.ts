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
 * - **iOS Safari 17.4+:** The Vibration API is not available. This module uses a hidden
 *   `input[switch]` element and programmatically toggles it; iOS plays its native switch haptic
 *   when that happens. No audio, no extra permissions.
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

/**
 * Type of the default export: an object with all haptic methods.
 * Use this when you need to type a variable that holds the default import.
 *
 * @example
 * import Haptic, { type Haptic } from "browser-haptic";
 * const feedback: Haptic = Haptic;
 */
export interface Haptic {
  hasVibration(): boolean;
  isSupported(): boolean;
  vibrate(pattern: VibrationPattern): void;
  light(): void;
  medium(): void;
  heavy(): void;
  success(): void;
  warning(): void;
  error(): void;
}

/** Presets for Vibration API (non-Android). Short durations for crisp haptic feedback. */
const VIBRATION_PRESETS = new Map<HapticPreset, number | number[]>([
  [HapticPreset.Light, 30],
  [HapticPreset.Medium, 50],
  [HapticPreset.Heavy, 80],
  [HapticPreset.Success, [20, 50, 20]],
  [HapticPreset.Warning, [40, 30, 40]],
  [HapticPreset.Error, [50, 30, 50, 30, 50]],
]);

/**
 * Presets for Android. Uses longer pulses (400–500ms) so vibration is not ignored on builds
 * that drop very short patterns. Kept minimal: single pulse for light/medium/heavy, 2–3
 * pulses for success/warning/error with short gaps.
 */
const ANDROID_VIBRATION_PRESETS = new Map<HapticPreset, number | number[]>([
  [HapticPreset.Light, 400],
  [HapticPreset.Medium, 400],
  [HapticPreset.Heavy, 500],
  [HapticPreset.Success, [400, 80, 400]],
  [HapticPreset.Warning, [400, 60, 400]],
  [HapticPreset.Error, [400, 50, 400, 50, 400]],
]);

/** Presets for iOS switch fallback. Multiple toggles so light/medium/heavy are noticeable. */
const IOS_PRESETS = new Map<HapticPreset, number | number[]>([
  [HapticPreset.Light, [15, 40, 15]],
  [HapticPreset.Medium, [15, 35, 15, 35, 15]],
  [HapticPreset.Heavy, [15, 30, 15, 30, 15, 30, 15]],
  [HapticPreset.Success, [20, 50, 20]],
  [HapticPreset.Warning, [40, 30, 40]],
  [HapticPreset.Error, [50, 30, 50, 30, 50]],
]);

const isAndroid = (): boolean =>
  typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent ?? "");

const getPreset = (variant: HapticPreset): VibrationPattern => {
  if (!hasVibrationAPI()) return IOS_PRESETS.get(variant)!;
  const presets = isAndroid() ? ANDROID_VIBRATION_PRESETS : VIBRATION_PRESETS;
  return presets.get(variant)!;
};

const hasVibrationAPI = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

const hasDOM = (): boolean =>
  typeof document !== "undefined" && !!document.body;

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

  const arr = toPatternArray(pattern);
  const pairs = Array.from(
    { length: Math.ceil(arr.length / 2) },
    (_, i) => [arr[i * 2] ?? 0, arr[i * 2 + 1] ?? 0] as const,
  );
  let delay = 0;
  for (const [vibrateMs, pauseMs] of pairs) {
    if (vibrateMs > 0) setTimeout(fireIOSSwitch, delay);
    delay += vibrateMs + pauseMs;
  }
};

/**
 * Checks whether the **Vibration API** is available on this environment.
 *
 * Returns `true` on Android and some desktop browsers that support
 * `navigator.vibrate`. Returns `false` on iOS Safari (which doesn’t implement
 * the Vibration API); on iOS you can still use the other functions—they will
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
 * Checks whether **any** haptic feedback can be triggered in this environment.
 *
 * Returns `true` if either the Vibration API is available or we’re in a browser
 * with a DOM (so the iOS switch fallback can run). Use this to decide whether
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
  return hasVibrationAPI() || hasDOM();
};

/**
 * Triggers a custom haptic pattern.
 *
 * Use this when the preset patterns (light, success, error, etc.) aren’t enough.
 * On Vibration API devices the pattern is passed through to `navigator.vibrate`.
 * On iOS the pattern is interpreted as a sequence of pulses: each “vibrate”
 * segment triggers one switch toggle, with pauses between them.
 *
 * @param pattern - Either a single duration in ms, or an array of
 *   [vibrate, pause, vibrate, pause, ...] in ms. Pause values are used as delays
 *   between pulses; they don’t trigger vibration themselves.
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
 * On Vibration API: ~30ms. On iOS: double tap for clearer feedback.
 */
export const light = (): void => trigger(getPreset(HapticPreset.Light));

/**
 * Triggers a medium-strength tap.
 *
 * Good for standard button presses and list item taps. Equivalent to a single
 * On Vibration API: ~50ms. On iOS: three short pulses for clearer feedback.
 */
export const medium = (): void => trigger(getPreset(HapticPreset.Medium));

/**
 * Triggers a strong tap.
 *
 * Use for important actions (e.g. submit, delete) where you want a more
 * noticeable response. On Vibration API: ~80ms. On iOS: four pulses.
 */
export const heavy = (): void => trigger(getPreset(HapticPreset.Heavy));

/**
 * Triggers a double-tap pattern (short, pause, short).
 *
 * Suggests “success” or “done”—e.g. after saving, completing a step, or
 * confirming a choice.
 */
export const success = (): void => trigger(getPreset(HapticPreset.Success));

/**
 * Triggers a double-tap pattern with stronger pulses.
 *
 * Suggests “warning” or “attention”—e.g. before a destructive action or when
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

const Haptic: Haptic = {
  hasVibration,
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
