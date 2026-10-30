# Changelog

## 1.1.1

### Fixed

- **iOS:** `attach()` no longer blocks scrolling. A swipe that started on an attached element could not scroll the page or a scrolling row (tab bars, carousels), because iOS treats a touch on a native switch as a touch on that control. The element is now covered by an invisible `<label>` tied to a hidden switch: the tap still toggles the switch for real, so the tick still plays, and swipes scroll normally.
- **iOS:** tapping an attached disabled element no longer plays a tick.

## 1.1.0

### Changed

- **Android:** presets are much shorter. `light()` was 400ms and `error()` about 1.3s; now `light()` is 15ms, single taps are at most 50ms and no preset lasts longer than 300ms. All Vibration API devices share one preset map.
- **iOS:** the hidden switch path runs only on iPhones with Safari 17.4+. Desktop Safari, desktop Firefox and iPads no longer get a stray hidden click, and `isSupported()` returns `false` there.
- **iOS:** every call fires exactly one tick, synchronously, so it stays inside the user's tap. Multi-tick patterns are gone because iOS dropped every tick after the first.
- The hidden switch's `click` and `change` events no longer bubble to `document`.

### Added

- `attach(el, preset?)`: haptic feedback on every tap of an element, returns a cleanup function. On iPhone it covers the element with an invisible native switch so the user's own tap plays the tick, the only approach that still buzzes on iOS 26.5+. Clicks are forwarded to the element. On Android it vibrates with the preset. Based on `attachIOSOverlay` from howdoiusekeyboard/haptics (MIT).
- `HapticPresetName` type: a preset enum value or its string name.
- `isReliable()`: `true` only when the Vibration API exists. On iPhone, `light()` and the other functions are silent on iOS 26.5+; use `attach()`.
- `HapticPreset` is now exported from the package entry.
- README section on iOS limits.

### Release

- Published from GitHub Actions with npm trusted publishing and provenance.
