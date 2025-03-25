import { Calendar, CalendarEvent, StatusEvent, User } from "../utils/types";
import {
  getCalendarEvents,
  getCalendars,
  getStatusEvents,
} from "../utils/utils";
import { CalendarSelect } from "./CalendarSelect";
import { useEffect, useState } from "react";
import { CalendarEventsList } from "./CalendarEventsList";
import { ButtonAddToSlack } from "./ButtonAddToSlack";
import { StatusEventsList } from "./StatusEventsList";
import { Button } from "@headlessui/react";
import { ModalHowItWorks } from "./ModalHowItWorks";

type AuthenticatedLayoutProps = {
  user: User;
};

export const AuthenticatedLayout = ({ user }: AuthenticatedLayoutProps) => {
  const [calendars, setCalendars] = useState<Calendar[] | null>(null);
  const [currentCalendar, setCurrentCalendar] = useState<Calendar | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[] | null>(
    null
  );

  const [statusEvents, setStatusEvents] = useState<StatusEvent[] | null>(null);
  const getCalendarsData = async () => {
    const resp = await getCalendars();
    setCalendars(resp);
    if (resp && resp.length > 0) {
      setCurrentCalendar(resp[0]);
      getCalendarEventsData(resp[0].id);
    }
  };
  const getCalendarEventsData = async (calendarId: string) => {
    const resp = await getCalendarEvents(calendarId);
    setCalendarEvents(resp);
  };

  const getStatusEventsData = async () => {
    const resp = await getStatusEvents();
    setStatusEvents(resp);
  };

  const handleCalendarSelect = (calendar: Calendar) => {
    setCurrentCalendar(calendar);
    getCalendarEventsData(calendar.id);
  };
  useEffect(() => {
    getCalendarsData();
    getStatusEventsData();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <div className="grid grid-cols-3 space-x-8 h-[85vh]">
        <div className="col-span-1 flex flex-col space-y-6 text-left">
          <p className="text-4xl font-extrabold">
            Welcome, {user.displayName}!
          </p>
          <div className="flex flex-row items-center justify-start space-x-3">
            {user.slack_user_id ? (
              <p className="font-extrabold text-green-600">
                Connected to Slack
              </p>
            ) : (
              <ButtonAddToSlack />
            )}
            <Button
              className="text-blue-600 font-bold italic text-sm"
              onClick={openModal}
            >
              (?) How it works
            </Button>
          </div>
          <div className="flex flex-col pt-4 space-y-4">
            {calendars && calendars.length > 0 && (
              <CalendarSelect
                calendars={calendars}
                label="Select a Calendar"
                onSelect={handleCalendarSelect}
              />
            )}
            {statusEvents && statusEvents.length > 0 && (
              <div className="flex flex-col space-y-2">
                <p className="font-bold pl-1">Your Status Events</p>
                <StatusEventsList events={statusEvents} />
              </div>
            )}
          </div>
        </div>
        <div className="col-span-2 overflow-y-scroll pr-4">
          {currentCalendar && calendarEvents && (
            <div className="flex flex-col space-y-4">
              <p className="text-2xl font-bold pb-2">
                Upcoming Events for{" "}
                <span className="font-extrabold">
                  {currentCalendar.summary}
                </span>
              </p>
              <CalendarEventsList
                events={calendarEvents}
                calendar={currentCalendar}
              />
            </div>
          )}
        </div>
      </div>
      <ModalHowItWorks isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};
