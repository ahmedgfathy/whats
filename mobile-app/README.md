# Real Estate Chat Mobile App

A React Native mobile application for searching and managing Arabic real estate WhatsApp chat messages, connected to a live Neon PostgreSQL database.

## Features

- **Arabic Language Support**: Full RTL support for Arabic real estate terms
- **Live Database Connection**: Connects to Neon PostgreSQL database
- **Property Search**: Advanced search functionality for real estate listings
- **Authentication**: Secure login with session management
- **Modern UI**: Beautiful gradient design with glass effects
- **Property Classification**: Automatic categorization of properties (apartment, villa, land, etc.)
- **Offline Support**: Local caching for better performance
- **Property Details**: Comprehensive property information display
- **Contact Integration**: Direct call and WhatsApp integration

## Tech Stack

- **React Native 0.73.0**: Latest React Native framework
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation between screens
- **Linear Gradient**: Beautiful gradient backgrounds
- **Vector Icons**: Material Design icons
- **Fast Image**: Optimized image loading
- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local data persistence
- **Toast Messages**: User feedback notifications

## Prerequisites

Before building the APK, ensure you have:

1. **Node.js** (v16 or higher)
2. **Android Studio** with Android SDK
3. **Java JDK** (v11 or higher)
4. **React Native CLI**: `npm install -g react-native-cli`

## Database Configuration

The app connects to a live Neon PostgreSQL database. Before building, update the database connection in `src/services/apiService.js`:

```javascript
const API_CONFIG = {
  baseURL: 'https://your-neon-db-server.com/api', // Replace with your actual server URL
  // ... other config
};
```

## Building the APK

### Method 1: Using Build Scripts (Recommended)

**For Windows:**
```bash
./build-apk.bat
```

**For Linux/macOS:**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

### Method 2: Manual Build

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Clean Previous Builds:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **Bundle the App:**
   ```bash
   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
   ```

4. **Generate APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. **Find Your APK:**
   The APK will be generated at:
   `android/app/build/outputs/apk/release/app-release.apk`

## Installation on Android Device

1. **Enable Unknown Sources:**
   - Go to Settings > Security > Unknown Sources
   - Enable "Install apps from unknown sources"

2. **Transfer APK:**
   - Copy the APK file to your Android device
   - You can use USB, cloud storage, or email

3. **Install APK:**
   - Open the APK file on your device
   - Follow the installation prompts

## App Configuration

### Default Login Credentials
- **Username**: `xinreal`
- **Password**: `zerocall`

### Language Support
- Arabic (RTL)
- English (LTR)
- Switch between languages using the language toggle button

### Property Types Supported
- شقة (Apartment)
- فيلا (Villa)
- أرض (Land)
- مكتب (Office)
- مخزن (Warehouse)
- محل (Shop)

## App Structure

```
src/
├── screens/
│   ├── LoginScreen.js          # Authentication screen
│   ├── DashboardScreen.js      # Main dashboard with property listings
│   └── PropertyDetailScreen.js # Detailed property view
├── services/
│   └── apiService.js           # API calls and database connection
├── theme/
│   └── theme.js                # App theme and colors
└── components/
    └── [Additional components]
```

## API Endpoints

The app expects the following API endpoints on your server:

- `POST /auth/login` - User authentication
- `GET /auth/validate` - Session validation
- `POST /auth/logout` - User logout
- `GET /messages` - Fetch property messages
- `POST /messages/search` - Search messages
- `POST /properties/search` - Search properties
- `GET /stats/property-types` - Property type statistics
- `GET /properties/:id` - Get property details
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property

## Design Features

### Color Scheme
- **Primary**: #667eea (Blue gradient)
- **Secondary**: #764ba2 (Purple gradient)
- **Background**: #0f0f23 (Dark theme)
- **Surface**: #1a1a2e (Card backgrounds)
- **Accent**: #8b5cf6 (Highlights)

### Typography
- System fonts with Arabic support
- Multiple font sizes for hierarchy
- Bold weights for headings

### Visual Effects
- Glass morphism effects
- Linear gradients
- Shadow elevations
- Smooth animations

## Customization

### Updating Server URL
Edit `src/services/apiService.js`:
```javascript
const API_CONFIG = {
  baseURL: 'https://your-server.com/api',
  // ... other settings
};
```

### Modifying Colors
Edit `src/theme/theme.js`:
```javascript
export const theme = {
  colors: {
    primary: '#your-color',
    // ... other colors
  }
};
```

### Adding New Languages
1. Add language texts to screen components
2. Update the language switching logic
3. Add RTL support for new languages

## Troubleshooting

### Common Issues

1. **Build Failed:**
   - Ensure Android SDK is properly installed
   - Check Java version compatibility
   - Clean and rebuild: `cd android && ./gradlew clean`

2. **Network Issues:**
   - Verify server URL is correct
   - Check network permissions in AndroidManifest.xml
   - Ensure server is accessible from mobile network

3. **Installation Issues:**
   - Enable "Unknown Sources" in Android settings
   - Check Android version compatibility (minimum API 21)
   - Ensure sufficient storage space

### Debug Mode
To run in debug mode:
```bash
npx react-native run-android
```

## Security Notes

- The app uses HTTPS for all API calls
- Session tokens are stored securely in AsyncStorage
- Network security config allows clear text traffic for development

## Performance Optimization

- Image lazy loading with FastImage
- Efficient list rendering with FlatList
- Local caching for frequently accessed data
- Optimized bundle size with Hermes engine

## Support

For support and questions:
- Check the troubleshooting section
- Review console logs for error details
- Ensure all dependencies are properly installed

## License

This project is proprietary software developed for Xinreal.

---

**Note**: Always test the APK on a physical device before distribution. The app requires internet connectivity to function properly as it connects to a live database server.
