import { useState } from "react";
import { User } from "../utils/user";

type AuthenticatedLayoutProps = {
  user: User;
};

export const AuthenticatedLayout = ({ user }: AuthenticatedLayoutProps) => {
  const [recurringEvents, setRecurringEvents] = useState(false);
  const toggleRecurringEvents = () => {
    setRecurringEvents(!recurringEvents);
  };
  return (
    <div>
      <div className="grid grid-cols-3 space-x-12">
        <div className="col-span-1 flex flex-col space-y-4 text-left">
          <h1 className="text-4xl font-extrabold">
            Welcome, {user.displayName}!
          </h1>
          <div className="flex flex-row space-x-2 items-center justify-start">
            <p>To start Syncing, </p>
            <button className="px-3 py-2 rounded-xl font-bold bg-cyan-500">
              Connect your Slack account
            </button>
          </div>
          <div className="flex flex-col space-y-4 pt-4">
            <button
              className="px-6 py-2 rounded-xl font-bold bg-cyan-400 max-w-fit"
              onClick={toggleRecurringEvents}
            >
              {recurringEvents ? "Hide" : "View"} Recurring Events
            </button>
          </div>
        </div>
        <div className="col-span-2">
          {recurringEvents && (
            <div className="flex flex-col space-y-4 text-left">
              <h1 className="text-2xl font-extrabold text-left">
                Recurring Events
              </h1>
              <div className="w-64 h-20 bg-cyan-300 rounded-xl p-4">
                Event 1
              </div>
              <div className="w-64 h-20 bg-cyan-300 rounded-xl p-4">
                Event 2
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-1 flex flex-col space-y-4 text-left bg-green-200"></div>
    </div>
  );
};
