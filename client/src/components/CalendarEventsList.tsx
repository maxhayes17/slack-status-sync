import { Calendar, CalendarEvent } from "../utils/types";
import { CalendarEventBlock } from "./CalendarEventBlock";

type CalendarEventsListProps = {
  calendar: Calendar;
  events: CalendarEvent[];
};
export const CalendarEventsList = ({
  events,
  calendar,
}: CalendarEventsListProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <p className="text-2xl font-bold pb-2">
        Upcoming Events for {calendar.summary}
      </p>
      {events.length > 0 ? (
        <div className="flex flex-col space-y-2">
          {events.map((event) => (
            <CalendarEventBlock
              event={event}
              color={event.color ? event.color : calendar.color}
              key={event.id}
            />
          ))}
        </div>
      ) : (
        <p>
          No events here yet! Add an event to your {calendar.summary} calendar
          to get started.
        </p>
      )}
    </div>
  );
};
