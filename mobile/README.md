# UniCycle Mobile App

React Native mobile app for the UniCycle student marketplace.

## Prerequisites

- Node.js installed
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Setup

### 1. Configure API Endpoint

Before testing on your phone, you need to configure the API endpoint:

1. Find your computer's local IP address:
   - **Windows**: Run `ipconfig` and look for "IPv4 Address"
   - **Mac**: Run `ifconfig` and look for your local network IP (usually starts with 192.168...)
   - **Linux**: Run `hostname -I`

2. Update `shared/config/api.js`:
   ```javascript
   development: {
       baseURL: 'http://YOUR_LOCAL_IP:8000',  // Example: 'http://192.168.1.100:8000'
   }
   ```

**Important**: Use your computer's IP address, NOT `localhost`, because your phone is a different device on the network.

### 2. Start the Backend

Make sure your FastAPI backend is running and accessible:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0
```

The `--host 0.0.0.0` flag makes your backend accessible from other devices on your network.

### 3. Start the Mobile App

```bash
cd mobile
npm start
```

This will start the Expo development server and show a QR code.

### 4. Test on Your Phone

1. Make sure your phone is on the **same WiFi network** as your computer
2. Open the **Expo Go** app on your phone
3. Scan the QR code displayed in your terminal
4. The app will load on your phone!

## Features Implemented

- ✅ Authentication (Login/Signup)
- ✅ Browse listings
- ✅ View item details
- ✅ User profile
- ✅ My interests tracking
- 🚧 Messages (coming soon)
- 🚧 Create listings (coming soon)
- 🚧 Image upload (coming soon)

## Project Structure

```
mobile/
├── src/
│   ├── api/          # API client & endpoints
│   ├── contexts/     # React contexts (Auth, etc.)
│   ├── navigation/   # Navigation setup
│   ├── screens/      # All app screens
│   └── components/   # Reusable components
├── App.js            # Main app entry point
└── app.json          # Expo configuration
```

## Troubleshooting

### App won't connect to backend

- Verify your backend is running with `--host 0.0.0.0`
- Check that your phone and computer are on the same WiFi
- Verify your IP address in `shared/config/api.js` is correct
- Try pinging your computer's IP from your phone's browser: `http://YOUR_IP:8000/health`

### QR code not scanning

- Try the "Scan QR Code" option in Expo Go manually
- Or copy the `exp://...` URL and paste it into Expo Go

### App crashes on startup

- Check terminal for error messages
- Ensure all dependencies are installed: `npm install`
- Try clearing cache: `npm start --clear`

## Next Steps

To build a standalone app for distribution:

```bash
# For Android
eas build --platform android

# For iOS (requires Apple Developer account)
eas build --platform ios
```

Note: You'll need to set up an Expo account and configure `eas.json` for this.
