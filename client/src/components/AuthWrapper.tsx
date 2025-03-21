import { useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut, GoogleAuthProvider} from "../utils/auth";
import { UnauthenticatedLayout } from "./UnauthenticatedLayout";
import { AuthenticatedLayout } from "./AuthenticatedLayout";
import { User } from "../utils/types";
import { ButtonPrimary } from "./ButtonPrimary";
import { GOOGLE_AUTH_STORAGE_KEY, storeToken } from "../utils/storage";
import { UserCredential } from "firebase/auth";
import { getUser } from "../utils/utils";

export const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const handleSignIn = async () => {
    signInWithPopup(auth, googleProvider)
        .then(async (resp: UserCredential) => {
          const credential = GoogleAuthProvider.credentialFromResult(resp);
          storeToken(GOOGLE_AUTH_STORAGE_KEY, credential?.accessToken || "");

          const userData = resp.user;
          if (userData) {
            const user = await getUser();
            setUser({
              displayName: user?.displayName ?? "",
              email: user?.email ?? "",
            });
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
        setUser(null);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  return (
    <div className="flex flex-col">
      <div className="left-0 top-0 z-10 p-4 flex w-full shrink-0 items-center justify-start space-x-2 h-16 bg-cyan-600">
        {user ? (
            <ButtonPrimary label="Sign Out" onClick={handleSignOut}/>
        ) : (
            <ButtonPrimary label="Sign in with Google" onClick={handleSignIn} />
        )}
      </div>
      <div className="mx-auto w-full p-8 pt-8">
        {user ? <AuthenticatedLayout user={user} /> : <UnauthenticatedLayout />}
      </div>
    </div>
  );
};
