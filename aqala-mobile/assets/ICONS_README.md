# App Icons Setup

The app needs the following icon files in the `assets/` directory:

## Required Icons

1. **icon.png** (1024x1024 PNG)
   - Main app icon
   - Used for iOS and Android

2. **splash-icon.png** (1284x2778 PNG recommended)
   - Splash screen image
   - Optional - will use solid color if not provided

3. **adaptive-icon.png** (1024x1024 PNG)
   - Android adaptive icon foreground
   - Optional for Android

4. **notification-icon.png** (96x96 PNG)
   - Notification icon
   - Optional

## Quick Setup

### Option 1: Use Online Icon Generator
1. Go to https://www.appicon.co/ or https://www.favicon-generator.org/
2. Upload a 1024x1024 PNG image
3. Download the generated icons
4. Place `icon.png` in `assets/` directory

### Option 2: Create Simple Placeholder
Create a simple 1024x1024 PNG with:
- Background: `#021a12` (dark green)
- Text: "AQALA" in white/gold
- Save as `assets/icon.png`

### Option 3: Use ImageMagick (if installed)
```bash
# Create a simple placeholder icon
convert -size 1024x1024 xc:"#021a12" \
  -gravity center -pointsize 200 -fill "#D4AF37" \
  -annotate +0+0 "AQALA" \
  assets/icon.png
```

## After Adding Icons

1. Uncomment the icon lines in `app.config.ts`:
   ```typescript
   icon: "./assets/icon.png",
   splash: {
       image: "./assets/splash-icon.png",
       ...
   }
   ```

2. Restart Expo:
   ```bash
   npx expo start --clear
   ```

## Current Status

Icons are currently commented out in `app.config.ts` to allow the app to run without them. Add proper icons before releasing to app stores.
