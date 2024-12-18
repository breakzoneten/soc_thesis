import 'dotenv/config';

export default {
  "expo": {
    "name": "Safe on Chat",
    "slug": "socsysteeemm",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.example.SOC",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@config-plugins/react-native-webrtc",
      [
        "onesignal-expo-plugin",
        {
          "mode": "development",
        }
      ]
    ],
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
      "oneSignalAppId": "621ffd52-6a10-4c59-9cc8-44c61e19635c",
      "eas": {
        "projectId": "82439ae0-c4b7-42bd-94db-91d341f6d613"
      }
    }

  }
}
