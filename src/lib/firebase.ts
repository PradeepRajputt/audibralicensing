
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCkz06VSmspaFJJcVvGk_XleG2p3-FSB4E",
  authDomain: "shieldview-5ns5s.firebaseapp.com",
  projectId: "shieldview-5ns5s",
  storageBucket: "shieldview-5ns5s.firebasestorage.app",
  messagingSenderId: "1073050793556",
  appId: "1:1073050793556:web:b8de76187aee60ed2c5fc1"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
