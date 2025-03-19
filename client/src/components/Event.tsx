import { CalendarEvent } from "../utils/types";

type CalendarEventProps = {
  event: CalendarEvent;
};
export const Event = ({ event }: CalendarEventProps) => {
  return (
    <div className="group flex flex-col p-2 rounded-lg bg-neutral-100 hover:cursor-pointer hover:bg-neutral-200">
      <div className="flex flex-row space-x-2 items-center">
        <p className="font-bold">{event.summary}</p>
        <button className="text-blue-600 font-bold invisible group-hover:visible hover:text-blue-500 pr-4">Add Status</button>
      </div>
      {event.start.date && event.end.date && (
        <p className="text-sm">
          {event.start.date} - {event.end.date}
        </p>
      )}
      {event.start.dateTime && event.end.dateTime && (
        <p className="text-sm">
          {event.start.dateTime} - {event.end.dateTime}
        </p>
      )}
    </div>
  );
};
