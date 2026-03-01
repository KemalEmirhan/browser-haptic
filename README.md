# haptic-js

Lightweight haptic feedback for JavaScript. This repo uses **Bun**. Uses the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) where available (e.g. Android). On **iOS Safari 17.4+** it uses a hidden `input[switch]` toggle so the native switch haptic fires. No runtime dependencies.

## Install

```bash
bun add haptic-js
```

## Usage

Import the default export as **`Haptic`** and call its methods:

```ts
import Haptic from "haptic-js";

if (Haptic.isSupported()) {
  Haptic.light();
  Haptic.success();
  Haptic.vibrate([10, 50, 10, 50, 10]);
}
```

**React example:**

```tsx
import Haptic from "haptic-js";

const App = () => {
  const supported = Haptic.isSupported();

  return (
    <button onClick={() => Haptic.heavy()}>
      Tap me
    </button>
  );
};
```

You can also use named imports if you prefer: `import { light, success, isSupported } from "haptic-js"`.

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

## Test

```bash
bun test
```

## Publishing

From the repo root: `bun run build` then `bun publish`. The package has no runtime dependencies and ships only the `dist/` output (~2.5 KB JS + types).

## License

MIT
