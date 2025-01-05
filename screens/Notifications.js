import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}

// import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';
// import * as Device from 'expo-device';
// import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
// import { app } from '../firebaseConfig';

// const firestore = getFirestore(app);

// // Configure how notifications are handled
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// function handleRegistrationError(errorMessage) {
//   alert(errorMessage);
//   throw new Error(errorMessage);
// }

// // Register for push notifications and save the token to Firestore
// export const registerForPushNotificationsAsync = async (userId) => {

//   if (Device.isDevice) {
//     let token;
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       console.warn('Failed to get push token for push notifications!');
//       return null;
//     }

//     const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//     if (!projectId) {
//       handleRegistrationError('Failed to get project ID for push notifications!');
//     }

//     try {
//       token = (
//         await Notifications.getExpoPushTokenAsync({
//           projectId,
//         })
//       ).data;
//       console.log(token);

//       if (userId) {
//         const userDoc = doc(firestore, 'users', userId);
//         await setDoc(userDoc, { expoPushToken: token }, { merge: true });
//         console.log('Push token saved to Firestore:', token);
//       }
//     } catch (e) {
//       handleRegistrationError(`${e}`);
//     }

//   } else {
//     console.warn('Must use a physical device for push notifications.');
//   }
//   return token;
// };

// // Retrieve the token for a user from Firestore
// export const getPushTokenForUser = async (userId) => {
//   if (!userId) {
//     console.warn('User ID is required to fetch push token.');
//     return null;
//   }

//   const userDoc = doc(firestore, 'users', userId);
//   const docSnapshot = await getDoc(userDoc);

//   if (docSnapshot.exists()) {
//     const data = docSnapshot.data();
//     return data.expoPushToken || null;
//   } else {
//     console.warn('No document found for the specified user ID.');
//     return null;
//   }
// };

// // Send a push notification
// export const sendPushNotification = async (expoPushToken, message) => {
//   if (!expoPushToken) {
//     console.warn('Expo push token is required to send notifications.');
//     return;
//   }

//   const messagePayload = {
//     to: expoPushToken,
//     sound: 'default',
//     title: message.title || 'Notification',
//     body: message.body || 'You have a new message.',
//     data: message.data || {},
//   };

//   try {
//     const response = await fetch('https://exp.host/--/api/v2/push/send', {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(messagePayload),
//     });

//     const result = await response.json();
//     console.log('Push notification sent successfully:', result);
//   } catch (error) {
//     console.error('Error sending push notification:', error);
//   }
// };
