import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import nativeAuth from '@react-native-firebase/auth';

// Master Koti Firebase Configuration (Live Cloud)
const firebaseConfig = {
  apiKey: "AIzaSyAsnyXkCOyDMVpfhhOK7bs3LtL2oQsLPTc",
  authDomain: "gen-lang-client-0273077261.firebaseapp.com",
  projectId: "gen-lang-client-0273077261",
  storageBucket: "gen-lang-client-0273077261.firebasestorage.app",
  messagingSenderId: "800828927714",
  appId: "1:800828927714:android:ab48cea6994c7f074838bb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const mobileAuth = nativeAuth;
export const storage = getStorage(app);
