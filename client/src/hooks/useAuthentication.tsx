import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "../utils/auth";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  GOOGLE_AUTH_STORAGE_KEY,
  LAST_ACTIVE_TIME_STORAGE_KEY,
  storeItem,
} from "../utils/storage";
import { UserCredential } from "firebase/auth";
import dayjs from "dayjs";

type AuthenticationState = {
  hasAuthenticationBeenChecked: boolean;
  isAuthenticated: boolean;
  signIn?(): Promise<void>;
  signOut?(): Promise<void>;
};

// Firebase tokens expire after 1 hour, so track their expiration
// and sign the user out if they are expired
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes

const AuthenticationContext = createContext<AuthenticationState | undefined>(
  undefined
);

type AuthenticationProviderProps = {
  children: ReactNode;
};

export const AuthenticationProvider = ({
  children,
}: AuthenticationProviderProps) => {
  const [authenticationState, setAuthenticationState] =
    useState<AuthenticationState>({
      isAuthenticated: false,
      hasAuthenticationBeenChecked: false, // Tracking this value allows us to avoid redirect loops
    });

  useEffect(() => {
    const lastActiveTime = localStorage.getItem(LAST_ACTIVE_TIME_STORAGE_KEY);
    const currentTime = dayjs();
    const expirationTime = dayjs(lastActiveTime).add(SESSION_TIMEOUT_MS, "ms");
    if (lastActiveTime && currentTime.isAfter(expirationTime)) {
      // Session has expired, sign out the user
      handleSessionTimeout();
    }
    // Update the last active time
    localStorage.setItem(
      LAST_ACTIVE_TIME_STORAGE_KEY,
      currentTime.toISOString()
    );

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // wait for the token to be refreshed
          await user.getIdToken();

          setAuthenticationState((prev) => ({
            ...prev,
            isAuthenticated: true,
            hasAuthenticationBeenChecked: true,
          }));
        } catch (error) {
          console.error(
            "Authentication token has expired; Signing out...",
            error
          );
          handleSessionTimeout();
        }
      } else {
        await signOut(auth);
        setAuthenticationState((prev) => ({
          ...prev,
          isAuthenticated: false,
          hasAuthenticationBeenChecked: true,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (authenticationState.isAuthenticated) {
      return;
    }
    signInWithPopup(auth, googleProvider)
      .then(async (resp: UserCredential) => {
        const credential = GoogleAuthProvider.credentialFromResult(resp);
        storeItem(GOOGLE_AUTH_STORAGE_KEY, credential?.accessToken || "");
        if (resp.user) {
          setAuthenticationState((prev) => ({
            ...prev,
            isAuthenticated: true,
          }));
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  };
  const handleSignOut = async () => {
    signOut(auth)
      .then(() => {
        setAuthenticationState((prev) => ({
          ...prev,
          isAuthenticated: false,
        }));
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const handleSessionTimeout = async () => {
    setAuthenticationState((prev) => ({
      ...prev,
      isAuthenticated: false,
    }));
    await signOut(auth);
  };

  return (
    <AuthenticationContext.Provider
      value={{
        ...authenticationState,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {authenticationState.hasAuthenticationBeenChecked ? (
        children
      ) : (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      )}
    </AuthenticationContext.Provider>
  );
};

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      "useAuthentication must be used within a <AuthenticationProvider>"
    );
  }
  return context;
};
