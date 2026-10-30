"use client";

import { useEffect, useRef } from "react";
import Haptic, { type HapticPresetName } from "browser-haptic";

/**
 * Haptic feedback on every tap of the returned ref's element.
 * Uses attach(), the only approach that buzzes on iOS 26.5+.
 */
export const useHaptic = <T extends HTMLElement>(preset: HapticPresetName = "light") => {
  const ref = useRef<T>(null);
  useEffect(() => (ref.current ? Haptic.attach(ref.current, preset) : undefined), [preset]);
  return ref;
};
