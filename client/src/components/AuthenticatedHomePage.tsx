import { Calendar, CalendarEvent, StatusEvent, User } from "../utils/types";
import {
  getCalendarEvents,
  getCalendars,
  getStatusEvents,
  getUser,
} from "../utils/utils";
import { CalendarSelect } from "./CalendarSelect";
import { useEffect, useState } from "react";
import { CalendarEventsList } from "./CalendarEventsList";
import { ButtonAddToSlack } from "./ButtonAddToSlack";
import { StatusEventsList } from "./StatusEventsList";
import { Button } from "@headlessui/react";
import { ModalHowItWorks } from "./ModalHowItWorks";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";

export const AuthenticatedHomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [calendars, setCalendars] = useState<Calendar[] | null>(null);
  const [currentCalendar, setCurrentCalendar] = useState<Calendar | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[] | null>(
    null
  );
  const [statusEvents, setStatusEvents] = useState<StatusEvent[] | null>(null);

  const getPageData = async () => {
    setIsLoading(true);
    try {
      await getUserData();
      await getCalendarsData();
      await getStatusEventsData();
    } catch (error) {
      console.error("Error fetching page data:", error);
      setIsError(true);
    }
    setIsLoading(false);
  };

  // for fetches that are part of populating the page,
  // just throw the error to bubble it up, and getPageData will set the error
  const getUserData = async () => {
    try {
      const resp = await getUser();
      setUser(resp);
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };
  const getCalendarsData = async () => {
    try {
      const resp = await getCalendars();
      setCalendars(resp);
      if (resp && resp.length > 0) {
        setCurrentCalendar(resp[0]);
        await getCalendarEventsData(resp[0].id);
      }
    } catch (error) {
      console.error("Error fetching calendars data:", error);
      throw error;
    }
  };
  const getCalendarEventsData = async (calendarId: string) => {
    try {
      const resp = await getCalendarEvents(calendarId);
      const sorted = resp?.sort((a, b) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
      });
      setCalendarEvents(sorted ?? null);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      setIsError(true);
    }
  };
  const getStatusEventsData = async () => {
    try {
      const resp = await getStatusEvents();
      setStatusEvents(resp);
    } catch (error) {
      console.error("Error fetching status events data:", error);
      throw error;
    }
  };

  const handleCalendarSelect = (calendar: Calendar) => {
    try {
      setCurrentCalendar(calendar);
      getCalendarEventsData(calendar.id);
    } catch (error) {
      console.error("Error selecting calendar:", error);
      setIsError(true);
    }
  };

  // In dev Strict Mode, React components will mount/unmount/remount by design, which means effects will run twice.
  // use a local variable to track if the component is mounted to avoid fetching twice.
  let isMounted = false;

  useEffect(() => {
    if (!isMounted) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isMounted = true;
      getPageData();
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (isError) {
    return <ErrorMessage />;
  }
  return (
    <div>
      {user && (
        <div className="grid grid-cols-5 space-x-12 h-[83vh]">
          <div className="col-span-2 flex flex-col space-y-6 text-left">
            <p className="text-4xl font-extrabold">
              Welcome, {user.display_name}!
            </p>
            <div className="flex flex-row items-center justify-start space-x-3">
              {user.slack_user_id ? (
                <p className="font-extrabold text-green-600 dark:text-green-500">
                  Connected to Slack
                </p>
              ) : (
                <ButtonAddToSlack />
              )}
              <Button
                className="text-blue-600 dark:text-blue-400 font-bold italic text-sm"
                onClick={openModal}
              >
                (?) How it works
              </Button>
            </div>
            <div className="flex flex-col space-y-6 pt-4">
              {calendars && calendars.length > 0 && (
                <CalendarSelect
                  calendars={calendars}
                  label="Select a Calendar"
                  onSelect={handleCalendarSelect}
                />
              )}
              {statusEvents && statusEvents.length > 0 && (
                <StatusEventsList events={statusEvents} />
              )}
            </div>
          </div>
          <div className="col-span-3 overflow-y-auto pr-12">
            {currentCalendar && calendarEvents && (
              <CalendarEventsList
                events={calendarEvents}
                calendar={currentCalendar}
              />
            )}
          </div>
          <ModalHowItWorks isOpen={isOpen} onClose={closeModal} />
        </div>
      )}
    </div>
  );
};
