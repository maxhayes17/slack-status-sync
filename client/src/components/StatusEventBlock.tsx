import { formatDateTime } from "../utils/date";
import { StatusEvent } from "../utils/types";

type StatusEventBlockProps = {
  event: StatusEvent;
};
export const StatusEventBlock = ({ event }: StatusEventBlockProps) => {
  return (
    <div className="flex flex-col p-2 rounded-lg bg-neutral-100 hover:cursor-pointer hover:bg-neutral-200 mr-4">
      <div className="flex flex-row space-x-1 items-center">
        {/* <img
          src="https://statussyncer.slack.com/emoji/bowtie/46ec6f2bb0.png"
          alt="Emoji"
          className="w-6 h-6"
        /> */}
        <p>{event.statusEmoji}</p>
        <p className="font-bold">{event.statusText}</p>
      </div>
      <p className="text-sm">
        {formatDateTime(event.start, false)} -{" "}
        {formatDateTime(event.end, false)}
      </p>
    </div>
  );
};
