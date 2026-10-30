# browser-haptic

[![npm version](https://img.shields.io/npm/v/browser-haptic.svg)](https://www.npmjs.com/package/browser-haptic)
[![npm downloads](https://img.shields.io/npm/dm/browser-haptic.svg)](https://www.npmjs.com/package/browser-haptic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Haptic feedback for the web: vibration on Android, native ticks on iPhone. No dependencies.

**[Try it on your phone →](https://playground-neon-gamma.vercel.app)**

## Install

```bash
npm install browser-haptic   # or: bun add / pnpm add / yarn add
```

## Usage

Attach feedback to an element once. Every tap on it then buzzes.

```ts
import Haptic from "browser-haptic";

const detach = Haptic.attach(document.querySelector("#save")!, "success");
detach(); // remove it later, e.g. on unmount
```

**React:**

```tsx
const SaveButton = () => {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => Haptic.attach(ref.current!, "success"), []);
  return <button ref={ref} onClick={save}>Save</button>;
};
```

The playground has the same example for Vue, Svelte and Angular.

## Platform support

| Platform | `attach(el)` | `light()`, `success()`, … |
|---|---|---|
| Android | Vibrates with the preset | Vibrates with the preset |
| iPhone, iOS 26.5+ | One tick per tap | Silent |
| iPhone, iOS 17.4 to 26.4 | One tick per tap | One tick, only inside a tap handler |
| iPad | Nothing (no Taptic Engine) | Nothing |
| Desktop | Nothing (Chrome accepts the call, but there is no motor) | Nothing |
| Server (SSR) | Safe no-op | Safe no-op |

**Use `attach()`.** It is the only way to get haptics on current iPhones.

## API

| Method | What it does |
|---|---|
| `attach(el, preset?)` | Feedback on every tap of `el`. Returns a cleanup function. `preset` defaults to `"light"` |
| `light()`, `medium()`, `heavy()` | Single tap: 15, 25, 40 ms |
| `success()`, `warning()`, `error()` | Two, two longer, three pulses |
| `vibrate(pattern)` | Custom pattern in ms: `50` or `[vibrate, pause, vibrate, …]` |
| `isSupported()` | `true` when the Vibration API exists, or on iPhone with Safari 17.4+ |
| `isReliable()` | `true` only with the Vibration API (Android). iPhone ticks are best effort |
| `hasVibration()` | `true` when `navigator.vibrate` exists |

Presets are `"light" | "medium" | "heavy" | "success" | "warning" | "error"` (type `HapticPresetName`). Everything is available as a named import too: `import { attach } from "browser-haptic"`.

## How it works on iPhone

iOS has no Vibration API. The only haptic a web page can reach is the tick a native switch (`<input type="checkbox" switch>`) plays when the user toggles it.

`attach()` covers your element with an invisible `<label>` tied to a hidden switch. Your user's tap toggles the switch for real, so iOS plays the tick, and the tap is forwarded to your element as a normal click. `onClick`, form submits and links keep working, and swipes that start on the element still scroll.

Limits:

- **One tick per tap.** iOS has no strength control, so every preset feels the same.
- **Ticks triggered from code are ignored** on iOS 26.5+, so `light()` and friends are silent there.
- The forwarded click has `isTrusted: false`. Keyboard users activate the element normally, without a tick.

The overlay technique is adapted from [`attachIOSOverlay`](https://github.com/howdoiusekeyboard/haptics/blob/main/packages/core/src/engine.ts) in [howdoiusekeyboard/haptics](https://github.com/howdoiusekeyboard/haptics) (MIT).

## Contributing

1. `bun install`
2. `bun test`
3. Open a pull request. For larger changes, open an issue first.

The playground lives in `playground/`.

## License

MIT © 2026 Emirhan Kemal Kosem
