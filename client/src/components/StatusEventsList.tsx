import { StatusEvent } from "../utils/types"
import { StatusEventBlock } from "./StatusEventBlock"

type StatusEventsListProps = {
    events: StatusEvent[]
}
export const StatusEventsList = ({ events }: StatusEventsListProps) => {
    return (
        <div className="flex flex-col space-y-2">
            {events.map((event) => (
                <StatusEventBlock event={event} key={event.id} />
            ))}
        </div>
    )
}