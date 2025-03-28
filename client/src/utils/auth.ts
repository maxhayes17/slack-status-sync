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

  // const idToken = getItem(FIREBASE_ID_TOKEN_STORAGE_KEY);
  const accessToken = getItem(GOOGLE_AUTH_STORAGE_KEY);
  return {
    Authorization: `Bearer ${idToken}`,
    "X-OAuth-Access-Token": accessToken ?? "",
  };
};

// Slack auth
const SLACK_OAUTH_BASE_URL = `https://slack.com/oauth/v2/authorize`;
const SLACK_OAUTH_REDIRECT_URI = encodeURIComponent(
  `${process.env.REACT_APP_STATUS_SYNCER_SERVER_URL}/auth/slack/callback`
);
const SLACK_OAUTH_SCOPES = "users.profile:read,users.profile:write,emoji:read";

export const SLACK_OAUTH_URL = `${SLACK_OAUTH_BASE_URL}?client_id=${process.env.REACT_APP_SLACK_CLIENT_ID}&redirect_uri=${SLACK_OAUTH_REDIRECT_URI}&user_scope=${SLACK_OAUTH_SCOPES}`;

export {
  auth,
  googleProvider,
  getAuthHeaders,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
};
