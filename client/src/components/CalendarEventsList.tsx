import { CalendarEvent } from "../utils/types"
import { Event } from "./Event"

type CalendarEventsListProps = {
    events: CalendarEvent[]
}
export const CalendarEventsList = ({ events }: CalendarEventsListProps) => {
    return (
        <div className="flex flex-col space-y-2">
            {events.map((event) => (
                <Event event={event} key={event.id} />
            ))}
        </div>
    )
}