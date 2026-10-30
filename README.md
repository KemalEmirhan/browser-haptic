# browser-haptic

[![npm version](https://img.shields.io/npm/v/browser-haptic.svg)](https://www.npmjs.com/package/browser-haptic)
[![npm downloads](https://img.shields.io/npm/dm/browser-haptic.svg)](https://www.npmjs.com/package/browser-haptic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Lightweight haptic feedback for JavaScript. Uses the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) where available (e.g. Android). On **iPhone with Safari 17.4+**, `attach()` covers your button with an invisible label tied to a native switch, so the user's tap plays the iOS switch tick (see [iOS](#ios)). No runtime dependencies.

**[Try the playground →](https://playground-neon-gamma.vercel.app)**: live demo, install commands, and code samples for React, Vue, Svelte, Angular, and TypeScript.

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [iOS](#ios)
- [Playground](#playground)
- [Contributing](#contributing)

## Install

**npm**

```bash
npm install browser-haptic
```

**bun**

```bash
bun add browser-haptic
```

**pnpm**

```bash
pnpm add browser-haptic
```

**yarn**

```bash
yarn add browser-haptic
```

## Usage

**Recommended: `attach()` an element.** This is the only approach that buzzes on current iPhones (iOS 26.5 and later), and it works on Android too:

```ts
import Haptic from "browser-haptic";

const detach = Haptic.attach(document.querySelector("#save")!, "success");
// later, e.g. on unmount
detach();
```

**React:**

```tsx
import { useEffect, useRef } from "react";
import Haptic from "browser-haptic";

const SaveButton = () => {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => Haptic.attach(ref.current!, "success"), []);
  return <button ref={ref} onClick={save}>Save</button>;
};
```

**Calling presets directly** works on Android. On iPhone it is best effort and silent on iOS 26.5+:

```ts
import Haptic from "browser-haptic";

if (Haptic.isSupported()) {
  Haptic.light();
  Haptic.success();
  Haptic.vibrate([10, 50, 10, 50, 10]);
}
```

You can also use named imports if you prefer: `import { light, success, isSupported } from "browser-haptic"`.

## API

| Method | Description |
|--------|-------------|
| `Haptic.attach(el, preset?)` | Haptic feedback on every tap of `el`. Returns a cleanup function. Recommended for iPhone. `preset` defaults to `"light"` and is ignored on iPhone |
| `Haptic.isSupported()` | `true` if feedback can run: Vibration API, or an iPhone with Safari 17.4+. `false` on desktop Safari, desktop Firefox and iPads |
| `Haptic.isReliable()` | `true` only when the Vibration API exists. On iPhone only `attach()` is reliable |
| `Haptic.hasVibration()` | `true` only when the Vibration API is available (e.g. Android) |
| `Haptic.vibrate(pattern)` | Trigger feedback: `number` (ms) or `number[]` (vibrate/pause sequence) |
| `Haptic.light()` | Short tap |
| `Haptic.medium()` | Medium tap |
| `Haptic.heavy()` | Strong tap |
| `Haptic.success()` | Double tap |
| `Haptic.warning()` | Triple tap |
| `Haptic.error()` | Longer alert pattern |

**Types:** `VibrationPattern` = `number | number[]` (for `vibrate()`). `HapticPresetName` = `HapticPreset` or its string name, e.g. `"success"` (for `attach()`).

On an iPhone with Safari 17.4+, `isSupported()` is `true` but `isReliable()` and `hasVibration()` are `false`.

## iOS

iOS has no Vibration API. The only web haptic on iPhone is the tick a native switch (`<input type="checkbox" switch>`, Safari 17.4+) plays when it is toggled.

**Use `attach()`.** It covers your element with an invisible `<label>` tied to a hidden native switch, so the user's finger toggles the switch for real and iOS plays the tick. Because the cover is a label and not the switch itself, swipes that start on the element still scroll, including inside scrolling rows and lists. The tap is then forwarded to your element as a click, so `onClick` handlers, form submits and links keep working. Since iOS 26.5, this is the only approach that still buzzes.

- One tick per tap. Presets, patterns and intensity have no effect on iPhone.
- iPads are not supported. They have no Taptic Engine.
- The forwarded click is a synthetic event (`isTrusted` is `false`).
- Keyboard users activate the element normally (no haptic); screen readers ignore the overlay.

**`light()`, `success()` and the other functions** toggle a hidden switch from code. iOS 26.5+ ignores script-triggered toggles even inside a tap, so they are silent there (confirmed on iOS 27). On older iOS they must be called synchronously inside a tap handler, never after `await` or a timer. Their hidden switch's `click` and `change` events stop at the switch, so normal `document` listeners do not see them; capture-phase listeners on `document` or `window` still do.

The overlay technique is adapted from [`attachIOSOverlay`](https://github.com/howdoiusekeyboard/haptics/blob/main/packages/core/src/engine.ts) from [howdoiusekeyboard/haptics](https://github.com/howdoiusekeyboard/haptics) (MIT).

## Playground

A live demo and docs site is available at **[playground-neon-gamma.vercel.app](https://playground-neon-gamma.vercel.app)**. You can try haptic feedback in the browser, copy install commands, and see framework-specific examples (React, Vue, Svelte, Angular, TypeScript). The playground source lives in the `playground/` directory of this repo.

## Contributing

Contributions are welcome. To get started:

1. Fork the repo and clone it locally.
2. Install dependencies: `bun install`
3. Make your changes and run tests: `bun test`
4. Open a pull request with a short description of the change.

For bugs or feature ideas, please open an issue first so we can discuss.

## License

MIT Copyright (c) 2026 Emirhan Kemal Kosem
