#!/bin/bash

# Script to create .env file from Next.js .env.local
# Usage: ./setup-env.sh [path-to-nextjs-env-file]

ENV_SOURCE="${1:-../.env.local}"

if [ ! -f "$ENV_SOURCE" ]; then
  echo "❌ Error: $ENV_SOURCE not found"
  echo "Usage: ./setup-env.sh [path-to-nextjs-env-file]"
  echo "Example: ./setup-env.sh ../.env.local"
  exit 1
fi

echo "📋 Creating .env file from $ENV_SOURCE..."

# Create .env file
cat > .env << 'ENVEOF'
# Firebase Configuration
# Auto-generated from Next.js .env.local
ENVEOF

# Copy Firebase variables (NEXT_PUBLIC_ -> EXPO_PUBLIC_)
grep "^NEXT_PUBLIC_FIREBASE_" "$ENV_SOURCE" | sed 's/^NEXT_PUBLIC_/EXPO_PUBLIC_/' >> .env

# Add Google Sign-In section
cat >> .env << 'ENVEOF'

# Google Sign-In
ENVEOF

# Copy Google variables if they exist
if grep -q "GOOGLE.*CLIENT_ID" "$ENV_SOURCE"; then
  grep "GOOGLE.*CLIENT_ID" "$ENV_SOURCE" | sed 's/^NEXT_PUBLIC_/EXPO_PUBLIC_/' >> .env
else
  echo "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=" >> .env
  echo "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=" >> .env
fi

# Add other variables
cat >> .env << 'ENVEOF'

# Backend API URL
ENVEOF

if grep -q "NEXT_PUBLIC_BASE_URL\|NEXT_PUBLIC_WEB_URL" "$ENV_SOURCE"; then
  grep "NEXT_PUBLIC_BASE_URL\|NEXT_PUBLIC_WEB_URL" "$ENV_SOURCE" | head -1 | sed 's/^NEXT_PUBLIC_/EXPO_PUBLIC_/' >> .env
else
  echo "EXPO_PUBLIC_WEB_URL=https://aqala.io" >> .env
fi

# Add LiveKit if exists
if grep -q "NEXT_PUBLIC_LIVEKIT_URL" "$ENV_SOURCE"; then
  echo "" >> .env
  echo "# LiveKit" >> .env
  grep "NEXT_PUBLIC_LIVEKIT_URL" "$ENV_SOURCE" | sed 's/^NEXT_PUBLIC_/EXPO_PUBLIC_/' >> .env
fi

echo "✅ .env file created successfully!"
echo ""
echo "📝 Please review and fill in any missing values:"
echo "   - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
echo "   - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"
echo "   - EXPO_PUBLIC_LIVEKIT_URL (if using LiveKit)"
echo ""
