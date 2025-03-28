import { useAuthentication } from "../hooks/useAuthentication";
import { AuthenticatedHomePage } from "./AuthenticatedHomePage";
import { ButtonAuthentication } from "./ButtonAuthentication";
import { LoadingSpinner } from "./LoadingSpinner";
import { UnauthenticatedHomePage } from "./UnauthenticatedHomePage";

export const HomePage = () => {
  const { hasAuthenticationBeenChecked, isAuthenticated } = useAuthentication();

  if (!hasAuthenticationBeenChecked) {
    return <LoadingSpinner />;
  }
  return (
    <div className="flex flex-col h-full w-full">
      {/* Navbar */}
      <div className="left-0 top-0 z-10 p-4 flex w-full shrink-0 items-center justify-start space-x-2 h-16 bg-neutral-200">
        <ButtonAuthentication />
      </div>
      {/* Body */}
      <div className="mx-auto w-full p-8 pt-8">
        {isAuthenticated ? (
          <AuthenticatedHomePage />
        ) : (
          <UnauthenticatedHomePage />
        )}
      </div>
    </div>
  );
};
