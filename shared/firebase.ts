import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Master Koti Firebase Configuration (Live Cloud)
const firebaseConfig = {
  apiKey: "AIzaSyAsnyXkCOyDMVpfhhOK7bs3LtL2oQsLPTc",
  authDomain: "gen-lang-client-0273077261.firebaseapp.com",
  projectId: "gen-lang-client-0273077261",
  storageBucket: "gen-lang-client-0273077261.firebasestorage.app",
  messagingSenderId: "800828927714",
  appId: "1:800828927714:web:c65f9d308f69b3824838bb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
