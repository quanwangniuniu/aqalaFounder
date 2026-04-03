# Step-by-step: Dev vs Production setup

You have **two Firebase projects**:
- **aqala-dev** → for testing (no real user data, safe to break things)
- **aqala-de71b** → for the real app (App Store / Play Store)

This guide sets the app so **dev builds** use aqala-dev and **store builds** use aqala-de71b.

---

## Part A: When does the app use which project?

| What you do | Which Firebase is used |
|-------------|-------------------------|
| Run the app via **Expo Go** / iOS simulator (`npx expo start`) | **.env.development** if it exists (aqala-dev), otherwise **.env** |
| Build with **EAS** for testing (`eas build --profile development`) | **aqala-dev** |
| Build with **EAS** for App Store / Play Store (`eas build --profile production`) | **aqala-de71b** (production) |

So: **development** and **preview** = aqala-dev. **production** = aqala-de71b.

---

## Part B: Get aqala-dev credentials (one-time)

You need to copy a few values from the Firebase website for the **aqala-dev** project.

### Step 1: Open Firebase

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com).
2. Click the project **Aqala-dev** (not “Aqala”).
3. Click the **gear icon** next to “Project Overview” → **Project settings**, then scroll to **“Your apps”**.

### Step 2: Get the main config

You can get the same config from either the **Web** app or the **iOS** app (same project = same values). Use the one that matches what you’re setting up.

**Option A – From the Web app (for .env / JS config)**  
1. Under **“Your apps”**, click the **Web** app (e.g. “AqalaDev”, icon `</>`).  
2. If you don’t have one, click **“Add app”** → **Web** → name it (e.g. “Aqala Mobile Dev”) → **Register app**.  
3. Copy from the config block: **apiKey**, **authDomain**, **projectId**, **storageBucket**, **messagingSenderId**, **appId**.

**Option B – From the iOS app (for native iOS / Google Sign-In)**  
1. Under **“Your apps”**, in the **Apple apps** section, click your **iOS** app (**Aqala**, bundle ID `com.aqala.app`).  
2. You’ll see the same project config (apiKey, projectId, etc.) and an option to **download `GoogleService-Info.plist`**.  
3. For **aqala-dev**: if you haven’t added an iOS app to the aqala-dev project yet, click **“Add app”** → **Apple** → register with bundle ID `com.aqala.app`, then download the plist from that iOS app.  
4. Put `GoogleService-Info.plist` in the **`aqala-mobile`** folder (root). Your `app.config.ts` already points to `./GoogleService-Info.plist`.  
5. **Dev vs production**: the single plist file is used at build time. For **development** EAS builds using aqala-dev, use a plist downloaded from the **aqala-dev** project’s iOS app (e.g. name it `GoogleService-Info.plist` when building dev, or use a dev-specific path in app.config for dev profiles). For **production** builds, use the plist from **aqala-de71b** (your current file is production).

Write down from either option: **apiKey**, **authDomain**, **projectId**, **storageBucket**, **messagingSenderId**, **appId**.

### Step 3: Get Google Sign-In IDs (for “Continue with Google”)

1. In Firebase Project settings, go to the **“General”** tab.
2. Under “Your apps”, click your **Web** app.
3. Scroll to **“Google Sign-In”** or **“OAuth redirect domains”**.
4. Open [Google Cloud Console](https://console.cloud.google.com), switch the project at the top to the one linked to **aqala-dev** (often “Aqala-dev” or same name as Firebase project).
5. Go to **APIs & Services** → **Credentials**.
6. Under “OAuth 2.0 Client IDs” you need:
   - One **Web client** (type “Web application”). Copy its **Client ID**.
   - One **iOS client** (type “iOS”). Copy its **Client ID**.
   - If you don’t have an iOS client, create one: **Create Credentials** → **OAuth client ID** → Application type **iOS** → use bundle ID `com.aqala.app` (or your dev bundle ID).

You should now have:
- **Web client ID** (long string ending in `.apps.googleusercontent.com`)
- **iOS client ID** (same format)

---

## Part C: Put aqala-dev into the app

There are two places: **EAS builds** (cloud) and **local run** (your machine).

### Option 1 – EAS builds (`eas build`)

Sensitive values are **not** stored in `eas.json`. Profiles use EAS **environments** so variables come from [Expo — Environment variables](https://docs.expo.dev/eas/environment-variables/) (dashboard or `eas env:create`).

| Build profile | EAS `environment` | Firebase project |
|---------------|-------------------|------------------|
| `development`, `development-device`, `preview` | `development` | **aqala-dev** |
| `production` | `production` | **aqala-de71b** |

For the **`development`** EAS environment, create **plain text or sensitive** variables (names must match exactly):

- `EXPO_PUBLIC_FIREBASE_API_KEY` — Firebase Web **apiKey** (Part B)
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` — **messagingSenderId**
- `EXPO_PUBLIC_FIREBASE_APP_ID` — **appId**
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google OAuth Web client ID (Part B Step 3)
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` — Google OAuth iOS client ID
- `EXPO_PUBLIC_SONIOX_API_KEY` — Soniox client key used by the app

For the **`production`** EAS environment, set the **same six variable names** with **aqala-de71b** / production Google / production Soniox values.

Non-secret routing (project id, auth domain, AdMob unit IDs, Stripe price IDs, etc.) stays in `eas.json` under each profile’s `env` block.

**CI:** If you run `eas build` from GitHub Actions (or any CI), use an `EXPO_TOKEN` with access to this project. EAS injects dashboard variables during the remote build; you do not need to duplicate `EXPO_PUBLIC_*` secrets in GitHub unless you intentionally bypass EAS env (not recommended).

**CLI examples** (run from `aqala-mobile/`):

```bash
# List variables for an environment
eas env:list development

# Create/update one variable (repeat per name; use --force to overwrite)
eas env:create development \
  --name EXPO_PUBLIC_FIREBASE_API_KEY \
  --value "<from Firebase>" \
  --visibility secret \
  --non-interactive
```

After the first production build with this setup, confirm all six variables exist for **production** on expo.dev; missing vars fail the build at bundle time.

### Option 2 – Local run (Expo Go / iOS simulator with `npx expo start`)

**By default, local dev uses aqala-dev** so you don’t touch production.

1. In the **`aqala-mobile`** folder, copy the example file:
   ```bash
   cp .env.development.example .env.development
   ```
2. Open **`.env.development`** and fill in the aqala-dev values from Part B (apiKey, messagingSenderId, appId, Google client IDs, Soniox, LiveKit if needed). Keys match `.env.development.example`.
3. Keep **`.env`** with production (aqala-de71b) for production-oriented local runs. When you run `npx expo start`, the app loads `.env` then **`.env.development`**; the latter overrides, so you get **aqala-dev**.
4. Restart the dev server: stop it (Ctrl+C), then run `npx expo start` again.

Then when you open the app in Expo Go or the iOS simulator, it will use **aqala-dev**.

To use **production** (aqala-de71b) locally instead, either remove or rename `.env.development` so only `.env` is loaded.

---

## Part D: Quick reference – what to run when

**Local development (Expo Go / iOS simulator):**
```bash
cd aqala-mobile
npx expo start
```
→ Uses **.env.development** (aqala-dev) when it exists; otherwise uses `.env`. Create `.env.development` from `.env.development.example` and fill with aqala-dev values (Part C Option 2).

**Build for testing (internal / testers):**
```bash
cd aqala-mobile
eas build --profile development
```
→ Uses **aqala-dev** once the **development** EAS environment has the six variables in Part C Option 1.

**Build for App Store / Play Store:**
```bash
cd aqala-mobile
eas build --profile production
```
→ Uses **aqala-de71b** once the **production** EAS environment has the same six variable names with prod values.

---

## Checklist

- [ ] Part B: Got apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId from Firebase (aqala-dev) — from **Web** or **iOS** app.
- [ ] Part B (iOS): If using native iOS builds, downloaded **GoogleService-Info.plist** from the **iOS** app (Apple apps → Aqala) and placed it in `aqala-mobile/`; use aqala-dev’s plist for dev builds, aqala-de71b’s for production.
- [ ] Part B: Got Web and iOS OAuth client IDs from Google Cloud (for aqala-dev).
- [ ] Part C Option 1: Created the six EAS variables on expo.dev for **development** (aqala-dev) and **production** (aqala-de71b), names listed in Part C Option 1.
- [ ] Part C Option 2 (if you use Expo Go / simulator): Created `aqala-mobile/.env.development` from `.env.development.example` with aqala-dev values and restarted `npx expo start`.

After this, dev builds and (if you set .env) local run use **aqala-dev**; production builds use **aqala-de71b**.

---

## Deploy Firestore rules to both projects

The **Listen → Save insight** feature writes to `users/{userId}/insights`. If you see **“Missing or insufficient permissions”**, the app is using a Firebase project whose rules haven’t been deployed.

- **Your app uses the project from env:** When you run `npx expo start`, it uses **.env.development** (aqala-dev) if that file exists; otherwise **.env**. Deploy rules to the project you’re actually connecting to.
- Deploy to **both** projects so dev and prod work:

```bash
# From repo root (where firebase.json and firestore.rules live)

firebase use dev
firebase deploy --only firestore:rules

firebase use prod
firebase deploy --only firestore:rules

firebase use dev   # optional: switch back to dev
```

Then try saving an insight again.
