import { CalendarEvent } from "../utils/types"
import { CalendarEventBlock } from "./CalendarEventBlock"

type CalendarEventsListProps = {
    events: CalendarEvent[]
}
export const CalendarEventsList = ({ events }: CalendarEventsListProps) => {
    return (
        <div className="flex flex-col space-y-2">
            {events.map((event) => (
                <CalendarEventBlock event={event} key={event.id} />
            ))}
        </div>
    )
}