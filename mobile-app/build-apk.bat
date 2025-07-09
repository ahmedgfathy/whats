@echo off
REM Real Estate Chat App - APK Build Script for Windows
REM This script will build a production-ready APK file

echo 🏗️  Building Real Estate Chat App APK...

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the mobile-app directory.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Clean previous builds
echo 🧹 Cleaning previous builds...
rmdir /s /q "android\app\build" 2>nul
cd android && gradlew clean && cd ..

REM Bundle the app
echo 📱 Bundling React Native app...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

REM Generate APK
echo 🔨 Generating APK...
cd android && gradlew assembleRelease

REM Check if APK was created successfully
if exist "app\build\outputs\apk\release\app-release.apk" (
    echo ✅ APK built successfully!
    echo 📄 APK Location: android\app\build\outputs\apk\release\app-release.apk
    echo 📱 You can now install this APK on your Android device
    
    REM Copy APK to root directory for easy access
    copy "app\build\outputs\apk\release\app-release.apk" "..\RealEstateChatApp.apk"
    echo 📄 APK copied to: RealEstateChatApp.apk
) else (
    echo ❌ Error: APK build failed!
    exit /b 1
)

echo 🎉 Build completed successfully!
echo.
echo To install the APK on your Android device:
echo 1. Enable 'Unknown Sources' in your Android settings
echo 2. Transfer the APK file to your device
echo 3. Open the APK file on your device to install
echo.
echo Note: Make sure to update the API_CONFIG.baseURL in src/services/apiService.js
echo       to point to your live Neon database server before building.

pause
