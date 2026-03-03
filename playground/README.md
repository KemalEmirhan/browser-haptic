# browser-haptic Playground

Sample site for trying [browser-haptic](https://www.npmjs.com/package/browser-haptic) in the browser. Built with Next.js and deployable to Vercel.

## Run locally

From the repo root:

```bash
cd playground
bun install   # or npm install
bun run dev  # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For real haptics, use a mobile device or emulator (Android or iOS Safari 17.4+).

## Deploy (Vercel)

- Link this repo to Vercel and set the **Root Directory** to `playground`, or
- From `playground`: `vercel` (Vercel will detect Next.js).

The playground uses the local `browser-haptic` package via `"browser-haptic": "file:.."` in `package.json`.
