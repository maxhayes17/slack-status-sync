import clsx from "clsx";
import { StatusEvent } from "../utils/types";
import { StatusEventBlock } from "./StatusEventBlock";

type StatusEventsListProps = {
  events: StatusEvent[];
};

export const StatusEventsList = ({ events }: StatusEventsListProps) => {
  const upcomingEvents = events.filter((event) => {
    return new Date(event.end) > new Date();
  });
  const pastEvents = events.filter((event) => {
    return new Date(event.end) < new Date();
  });

  return (
    <div className="flex flex-col space-y-4">
      {upcomingEvents.length > 0 && (
        <div className={clsx("flex flex-col space-y-2 max-h-44 overflow-y-auto", {"max-h-80": pastEvents.length < 1})}>
          <p className="font-bold pl-1">Upcoming Status Events</p>
          {upcomingEvents.map((event) => (
            <StatusEventBlock event={event} key={event.id} />
          ))}
        </div>
      )}
      {pastEvents.length > 0 && (
        <div className={clsx("flex flex-col space-y-2 max-h-44 overflow-y-auto", {"max-h-80": upcomingEvents.length < 1})}>
          <p className="font-bold pl-1">Past Status Events</p>
          {pastEvents.map((event) => (
            <StatusEventBlock event={event} key={event.id} />
          ))}
        </div>
      )}
    </div>
  );
};
