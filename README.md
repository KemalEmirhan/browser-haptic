# browser-haptic

[![npm version](https://img.shields.io/npm/v/browser-haptic.svg)](https://www.npmjs.com/package/browser-haptic)
[![npm downloads](https://img.shields.io/npm/dm/browser-haptic.svg)](https://www.npmjs.com/package/browser-haptic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Lightweight haptic feedback for JavaScript. Uses the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) where available (e.g. Android). On **iOS Safari 17.4+** it uses a hidden `input[switch]` toggle so the native switch haptic fires. No runtime dependencies.

- [Install](#install)
- [Usage](#usage)
- [API](#api)
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
| `Haptic.isSupported()` | `true` if feedback is available (Vibration API or DOM for iOS switch fallback) |
| `Haptic.hasVibration()` | `true` only when the Vibration API is available (e.g. Android) |
| `Haptic.vibrate(pattern)` | Trigger feedback: `number` (ms) or `number[]` (vibrate/pause sequence) |
| `Haptic.light()` | Short tap |
| `Haptic.medium()` | Medium tap |
| `Haptic.heavy()` | Strong tap |
| `Haptic.success()` | Double tap |
| `Haptic.warning()` | Triple tap |
| `Haptic.error()` | Longer alert pattern |

**Type:** `VibrationPattern` = `number | number[]` (for `vibrate()`).

On iOS Safari 17.4+, `isSupported()` is `true` but `hasVibration()` is `false`; the library uses a hidden native switch toggle.

## Contributing

Contributions are welcome. To get started:

1. Fork the repo and clone it locally.
2. Install dependencies: `bun install`
3. Make your changes and run tests: `bun test`
4. Open a pull request with a short description of the change.

For bugs or feature ideas, please open an issue first so we can discuss.

## License

MIT Copyright (c) 2026 Emirhan Kemal Kosem
