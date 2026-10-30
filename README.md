# browser-haptic

[![npm version](https://img.shields.io/npm/v/browser-haptic.svg)](https://www.npmjs.com/package/browser-haptic)
[![npm downloads](https://img.shields.io/npm/dm/browser-haptic.svg)](https://www.npmjs.com/package/browser-haptic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Lightweight haptic feedback for JavaScript. Uses the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) where available (e.g. Android). On **iPhone with Safari 17.4+** it toggles a hidden `input[switch]` once so the native switch tick fires (best effort, see [iOS](#ios)). No runtime dependencies.

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

Import the default export as **`Haptic`** and call its methods:

```ts
import Haptic from "browser-haptic";

if (Haptic.isSupported()) {
  Haptic.light();
  Haptic.success();
  Haptic.vibrate([10, 50, 10, 50, 10]);
}
```

**React example:**

```tsx
import Haptic from "browser-haptic";

const App = () => {
  const supported = Haptic.isSupported();

  return (
    <button onClick={() => Haptic.heavy()}>
      Tap me
    </button>
  );
};
```

You can also use named imports if you prefer: `import { light, success, isSupported } from "browser-haptic"`.

## API

| Method | Description |
|--------|-------------|
| `Haptic.isSupported()` | `true` if feedback can run: Vibration API, or an iPhone with Safari 17.4+. `false` on desktop Safari, desktop Firefox and iPads |
| `Haptic.isReliable()` | `true` only when the Vibration API exists. On iPhone the tick is best effort |
| `Haptic.hasVibration()` | `true` only when the Vibration API is available (e.g. Android) |
| `Haptic.vibrate(pattern)` | Trigger feedback: `number` (ms) or `number[]` (vibrate/pause sequence) |
| `Haptic.light()` | Short tap |
| `Haptic.medium()` | Medium tap |
| `Haptic.heavy()` | Strong tap |
| `Haptic.success()` | Double tap |
| `Haptic.warning()` | Triple tap |
| `Haptic.error()` | Longer alert pattern |

**Type:** `VibrationPattern` = `number | number[]` (for `vibrate()`).

On an iPhone with Safari 17.4+, `isSupported()` is `true` but `isReliable()` and `hasVibration()` are `false`.

## iOS

iOS has no Vibration API. On iPhone the library toggles a hidden native switch, and iOS plays its switch tick. Limits:

- **Call it synchronously inside a tap handler.** Never after `await`, a timer or a fetch: iOS only plays the tick during a user gesture.
- **One tick only.** Every preset and every `vibrate()` pattern becomes a single tick. No patterns, no intensity.
- **It may be silent on iOS 26.5+.** Newer iOS versions ignore script-triggered switch toggles, even inside a tap. There is no way to detect this, so `isReliable()` is `false` on iPhone.
- **iPads are not supported.** They have no Taptic Engine.
- The hidden switch's `click` and `change` events stop at the switch, so normal `document` listeners (analytics autocapture, outside-click handlers) do not see them. Listeners registered in the capture phase on `document` or `window` still do.

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
