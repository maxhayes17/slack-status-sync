import { useEffect, useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut, GoogleAuthProvider} from "../utils/auth";
import { UnauthenticatedHomePage } from "./UnauthenticatedHomePage";
import { AuthenticatedHomePage } from "./AuthenticatedHomePage";
import { ButtonPrimary } from "./ButtonPrimary";
import { GOOGLE_AUTH_STORAGE_KEY, storeToken } from "../utils/storage";
import { UserCredential } from "firebase/auth";

export const AuthWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleSignIn = async () => {
    // if user is already auth'd, don't need to re-sign in
    if (isAuthenticated) {
      return;
    }
    signInWithPopup(auth, googleProvider)
        .then(async (resp: UserCredential) => {
          const credential = GoogleAuthProvider.credentialFromResult(resp);
          storeToken(GOOGLE_AUTH_STORAGE_KEY, credential?.accessToken || "");
          if (resp.user) {
            setIsAuthenticated(true);
          }
        })
        .catch((err: any) => {
          console.error(err);
        });
  };

  const handleSignOut = () => {
    // sign out with firebase
    signOut(auth)
      .then((resp: any) => {
        // reset user
        setIsAuthenticated(false);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  return (
    <div className="flex flex-col max-h-full">
      <div className="left-0 top-0 z-10 p-4 flex w-full shrink-0 items-center justify-start space-x-2 h-16 bg-neutral-200">
        {isAuthenticated ? (
            <ButtonPrimary label="Sign Out" onClick={handleSignOut}/>
        ) : (
            <ButtonPrimary label="Sign in with Google" onClick={handleSignIn} />
        )}
      </div>
      <div className="mx-auto w-full p-8 pt-8">
        {isAuthenticated ? <AuthenticatedHomePage /> : <UnauthenticatedHomePage />}
      </div>
    </div>
  );
};
