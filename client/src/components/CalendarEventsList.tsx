import { Calendar, CalendarEvent } from "../utils/types"
import { CalendarEventBlock } from "./CalendarEventBlock"

type CalendarEventsListProps = {
    calendar: Calendar,
    events: CalendarEvent[]
}
export const CalendarEventsList = ({ events, calendar }: CalendarEventsListProps) => {
    return (
        <div className="flex flex-col space-y-2">
            {events.map((event) => (
                <CalendarEventBlock event={event} color={event.color ? event.color : calendar.color} key={event.id} />
            ))}
        </div>
    )
}