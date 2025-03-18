import { User } from "../utils/types";
import { ButtonPrimary } from "./ButtonPrimary";
import { getCalendarEvents, getCalendars, getUser } from "../utils/utils";

type AuthenticatedLayoutProps = {
  user: User;
};

export const AuthenticatedLayout = ({ user }: AuthenticatedLayoutProps) => {
  return (
    <div>
      <div className="grid grid-cols-3 space-x-12">
        <div className="col-span-1 flex flex-col space-y-4 text-left">
          <h1 className="text-4xl font-extrabold">
            Welcome, {user.displayName}!
          </h1>
          <div className="flex flex-row space-x-2 items-center justify-start">
            <p className="font-bold">To start Syncing, </p>
            <button className="px-4 py-2 rounded-xl font-bold text-white bg-aubergine flex flex-row items-center hover:brightness-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[20px] w-[20px] mr-[12px]"
                viewBox="0 0 122.8 122.8"
              >
                <path
                  d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
                  fill="#e01e5a"
                ></path>
                <path
                  d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
                  fill="#36c5f0"
                ></path>
                <path
                  d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
                  fill="#2eb67d"
                ></path>
                <path
                  d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
                  fill="#ecb22e"
                ></path>
              </svg>
              Add to Slack
            </button>
          </div>
          <div className="flex flex-col space-y-4 pt-4">
            <ButtonPrimary label="Get User" onClick={getUser}/>
            <ButtonPrimary label="Get Calendars" onClick={getCalendars}/>
            <ButtonPrimary label="Get Calendar Events" onClick={() => getCalendarEvents("hayesmax21@gmail.com")} />
          </div>
        </div>
        <div className="col-span-2">
        </div>
      </div>
      <div className="col-span-1 flex flex-col space-y-4 text-left bg-green-200"></div>
    </div>
  );
};
