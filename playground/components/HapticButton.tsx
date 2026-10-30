"use client";

import type { ButtonHTMLAttributes } from "react";
import type { HapticPresetName } from "browser-haptic";
import { useHaptic } from "./useHaptic";

type HapticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { preset?: HapticPresetName };

/** A <button> that gives haptic feedback on every tap. */
export const HapticButton = ({ preset = "light", type = "button", ...props }: HapticButtonProps) => {
  const ref = useHaptic<HTMLButtonElement>(preset);
  return <button ref={ref} type={type} {...props} />;
};
