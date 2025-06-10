import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB02Olw46N7qlJlPfwIlDFNljSHD_HG_vo",
  authDomain: "adad-a313e.firebaseapp.com",
  projectId: "adad-a313e",
  storageBucket: "adad-a313e.firebasestorage.app",
  messagingSenderId: "326380062160",
  appId: "1:326380062160:web:7c86140dba2a5043e825d5",
  measurementId: "G-BP7DX4VF2N"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const database = getFirestore(app);

export { app, auth, database };
