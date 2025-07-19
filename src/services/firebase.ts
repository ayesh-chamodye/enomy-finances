import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAyOvwtxJl6T8y8_3E4SdaPBMMsRDKsEQ",
  authDomain: "enomy-finances.firebaseapp.com",
  databaseURL: "https://enomy-finances-default-rtdb.firebaseio.com",
  projectId: "enomy-finances",
  storageBucket: "enomy-finances.firebasestorage.app",
  messagingSenderId: "995527639288",
  appId: "1:995527639288:web:8187bfdcb46780ec11fb0d",
  measurementId: "G-Q8J89B58BS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
