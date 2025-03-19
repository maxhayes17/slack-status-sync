import { Calendar, CalendarEvent, User } from "../utils/types";
import { ButtonPrimary } from "./ButtonPrimary";
import { getCalendarEvents, getCalendars, getUser } from "../utils/utils";
import { CalendarSelect } from "./CalendarSelect";
import { useEffect, useState } from "react";
import { CalendarEventsList } from "./CalendarEventsList";
import { StatusEvent } from "./StatusEvent";
import { ButtonAddToSlack } from "./ButtonAddToSlack";

type AuthenticatedLayoutProps = {
  user: User;
};

export const AuthenticatedLayout = ({ user }: AuthenticatedLayoutProps) => {
  const [calendars, setCalendars] = useState<Calendar[] | null>(null);
  const [currentCalendar, setCurrentCalendar] = useState<Calendar | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[] | null>(
    null
  );

  const getCalendarsData = async () => {
    const resp = await getCalendars();
    setCalendars(resp);
  };
  const getCalendarEventsData = async (calendarId: string) => {
    const resp = await getCalendarEvents(calendarId);
    setCalendarEvents(resp);
  };

  const handleCalendarSelect = (calendar: Calendar) => {
    setCurrentCalendar(calendar);
    getCalendarEventsData(calendar.id);
  };
  useEffect(() => {
    getCalendarsData();
  }, []);

  const slackEnabled = false;
  return (
    <div>
      <div className="grid grid-cols-3 space-x-4">
        <div className="col-span-1 flex flex-col space-y-4 text-left">
          <p className="text-4xl font-extrabold">
            Welcome, {user.displayName}!
          </p>
          {slackEnabled && (
            <div className="flex flex-row items-center justify-start sm:flex-col sm:items-start sm:space-y-2">
              <p className="font-bold">To start Syncing, </p>
              <ButtonAddToSlack />
            </div>
          )}
          <div className="flex flex-col space-y-8 pt-4">
            {calendars && (
              <CalendarSelect
                calendars={calendars}
                label="Select a Calendar"
                onSelect={handleCalendarSelect}
              />
            )}
            <div className="flex flex-col space-y-2">
              <p className="font-bold pl-1">Your Status Events</p>
              <StatusEvent />
            </div>
          </div>
        </div>
        <div className="col-span-2">
          {currentCalendar && calendarEvents && (
            <div className="flex flex-col space-y-4">
              <p className="text-2xl font-bold pb-2">
                Upcoming Events for{" "}
                <span className="font-extrabold">
                  {currentCalendar.summary}
                </span>
              </p>
              <CalendarEventsList events={calendarEvents} />
            </div>
          )}
        </div>
      </div>
      <div className="col-span-1 flex flex-col space-y-4 text-left bg-green-200"></div>
    </div>
  );
};
