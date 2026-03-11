# Aqala

- **`website/`** — Next.js web app (Vercel: set **Root Directory** to `website`)
- **`aqala-mobile/`** — Expo React Native app (EAS / App Store / Play Store)

## Local development

- **Web:** `cd website && npm install && npm run dev`  
  - Copy root `.env` into `website/.env` (or `website/.env.local`) if you use one locally.
- **Mobile:** `cd aqala-mobile && npm install && npx expo start`

## Deployment

- **Vercel:** Connect this repo and set **Root Directory** to `website`. Do not use `aqala-mobile` as the project root.
- **Mobile:** Use EAS Build from the `aqala-mobile` directory.
