import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDOLjG64QLM_JEdJIm_fBlvdO8-2onfnAE",
  authDomain: "train-eg.firebaseapp.com",
  projectId: "train-eg",
  storageBucket: "train-eg.firebasestorage.app",
  messagingSenderId: "660986897667",
  appId: "1:660986897667:web:90fac579aacf7196deb536",
  measurementId: "G-W2MEVQP2D6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const signIn = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user.uid;
  } catch (e) {
    console.error('Auth error:', e);
    return null;
  }
};
