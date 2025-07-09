#!/bin/bash

# Real Estate Chat App - APK Build Script
# This script will build a production-ready APK file

echo "🏗️  Building Real Estate Chat App APK..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the mobile-app directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf android/app/build
cd android && ./gradlew clean && cd ..

# Bundle the app
echo "📱 Bundling React Native app..."
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# Generate APK
echo "🔨 Generating APK..."
cd android && ./gradlew assembleRelease

# Check if APK was created successfully
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK built successfully!"
    echo "📄 APK Location: android/app/build/outputs/apk/release/app-release.apk"
    echo "📱 You can now install this APK on your Android device"
    
    # Copy APK to root directory for easy access
    cp app/build/outputs/apk/release/app-release.apk ../RealEstateChatApp.apk
    echo "📄 APK copied to: RealEstateChatApp.apk"
else
    echo "❌ Error: APK build failed!"
    exit 1
fi

echo "🎉 Build completed successfully!"
echo ""
echo "To install the APK on your Android device:"
echo "1. Enable 'Unknown Sources' in your Android settings"
echo "2. Transfer the APK file to your device"
echo "3. Open the APK file on your device to install"
echo ""
echo "Note: Make sure to update the API_CONFIG.baseURL in src/services/apiService.js"
echo "      to point to your live Neon database server before building."
