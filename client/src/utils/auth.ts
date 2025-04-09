import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getItem, GOOGLE_AUTH_STORAGE_KEY } from "./storage";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(config);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.addScope("https://www.googleapis.com/auth/calendar.readonly");

const getAuthHeaders = async () => {
  const idToken = await auth.currentUser?.getIdToken();

  const accessToken = getItem(GOOGLE_AUTH_STORAGE_KEY);
  return {
    Authorization: `Bearer ${idToken}`,
    "X-OAuth-Access-Token": accessToken ?? "",
  };
};

export {
  auth,
  googleProvider,
  getAuthHeaders,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
};
