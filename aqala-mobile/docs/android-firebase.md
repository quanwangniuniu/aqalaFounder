# Android Firebase (`google-services.json`)

`app.config.ts` sets `android.googleServicesFile` to `process.env.GOOGLE_SERVICES_JSON` when present (EAS Build), otherwise `./google-services.json` for local runs and `expo prebuild`.

## Local development

1. Firebase Console → Project settings → Your apps → Android → package `com.aqala.app`.
2. Download `google-services.json` and save it as `aqala-mobile/google-services.json` (same folder as `app.config.ts`).
3. The file is gitignored; do not commit it.

## EAS Build (file environment variable)

On a machine that has the real file:

```bash
cd aqala-mobile
eas env:create production --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
```

Repeat for `preview` and/or `development` if those profiles build Android:

```bash
eas env:create preview --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
eas env:create development --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
```

During the build, EAS sets `GOOGLE_SERVICES_JSON` to the path of the uploaded file; Expo config picks it up automatically.

## Smoke test (Google Sign-In + Firebase Auth)

After an internal Android build (dev client or preview):

1. Install on a physical device.
2. Sign in with Google and confirm Firebase Auth session (profile / gated screens).
3. If Auth fails, verify SHA-1/256 for the signing keystore are registered in the Firebase Android app and that `google-services.json` matches that Firebase project.
