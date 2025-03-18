import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  UserCredential,
} from "firebase/auth";
import { getToken, GOOGLE_AUTH_STORAGE_KEY, storeToken } from "./storage";

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
  const accessToken = getToken(GOOGLE_AUTH_STORAGE_KEY);
  return {
    Authorization: `Bearer ${idToken}`,
    "X-Google-Access-Token": accessToken ?? "",
  };
};

// export const handleSignInWithGoogle = () => {
//   signInWithPopup(auth, googleProvider)
//     .then((resp: UserCredential) => {
//       const credential = GoogleAuthProvider.credentialFromResult(resp);
//       storeToken(GOOGLE_AUTH_STORAGE_KEY, credential?.accessToken || "");
//       console.log(credential);
//       console.log(resp);
//     })
//     .catch((err: any) => {
//       console.error(err);
//     });
// };

// export function handleSignOut() {
//   signOut(auth)
//     .then(() => {
//       console.log("Signed out");
//     })
//     .catch((err: any) => {
//       console.error(err);
//     });
// }
// async function handleGoogleSignIn() {
//   try {
// }

// GoogleAuthProvider.credentialFromResult()

export {
  auth,
  googleProvider,
  getAuthHeaders,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
};
