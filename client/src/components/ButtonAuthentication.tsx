import { useAuthentication } from "../hooks/useAuthentication";
import { ButtonPrimary } from "./ButtonPrimary";

export const ButtonAuthentication = () => {
  const { isAuthenticated, signIn, signOut } = useAuthentication();

  return isAuthenticated ? (
    <ButtonPrimary label="Sign Out" onClick={signOut} />
  ) : (
    <ButtonPrimary label="Sign in with Google" onClick={signIn} />
  );
};
