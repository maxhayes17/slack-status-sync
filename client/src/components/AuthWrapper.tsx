import { useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut } from "../utils/auth";
import { UnauthenticatedLayout } from "./UnauthenticatedLayout";
import { AuthenticatedLayout } from "./AuthenticatedLayout";
import { User } from "../utils/user";

export const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const handleGoogleSignIn = () => {
    googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
    // sign in with firebase
    signInWithPopup(auth, googleProvider)
      .then((resp: any) => {
        const userData = resp.user;
        // set current user
        setUser({
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
        });
        console.log(resp);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const handleGoogleSignOut = () => {
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
      <div className="left-0 top-0 z-10 p-4 flex w-full shrink-0 items-center justify-start space-x-2 h-16 bg-cyan-700">
        {user ? (
          <button
            className="px-3 py-2 rounded-xl font-bold bg-cyan-500"
            onClick={handleGoogleSignOut}
          >
            Sign out
          </button>
        ) : (
          <button
            className="px-3 py-2 rounded-xl font-bold bg-cyan-500"
            onClick={handleGoogleSignIn}
          >
            Sign in with Google
          </button>
        )}
      </div>
      <div className="mx-auto w-full p-8 pt-8">
        {user ? <AuthenticatedLayout user={user} /> : <UnauthenticatedLayout />}
      </div>
    </div>
  );
};
