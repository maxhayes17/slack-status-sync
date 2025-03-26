import { useState } from "react";
import { CalendarColor, CalendarEvent, StatusEvent } from "../utils/types";
import { Modal } from "./Modal";
import { StatusEventCreateForm } from "./StatusEventCreateForm";
import { formatDateTime } from "../utils/date";
import { postStatusEvent } from "../utils/utils";
import { clsx } from "clsx";

type CalendarEventBlockProps = {
  event: CalendarEvent;
  color?: CalendarColor;
};
export const CalendarEventBlock = ({
  event,
  color,
}: CalendarEventBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleStatusEventCreate = async (status_event: Partial<StatusEvent>) => {
    console.log("Creating status event: ", status_event);
    await postStatusEvent(status_event);
    closeModal();
  };

  return (
    <div
      style={{
        backgroundColor: color ? color.background : undefined,
        color: color ? color.foreground : undefined,
      }}
      className={clsx(
        "group flex flex-row justify-between p-2 rounded-lg w-2/3 hover:cursor-pointer",
        color ? "hover:bg-opacity-70" : "bg-neutral-100 hover:bg-neutral-200"
      )}
      onClick={openModal}
    >
      <div className="flex flex-col">
        <p className="font-bold">{event.summary}</p>
        {event.start &&
          event.end &&
          (event.all_day ? (
            <p className="text-sm">
              {formatDateTime(event.start, true)}{" "}
              <span className="ml-2 italic">(All day)</span>
            </p>
          ) : (
            <p className="text-sm">
              {formatDateTime(event.start, false)} -{" "}
              {formatDateTime(event.end, false)}
            </p>
          ))}
        <Modal isOpen={isOpen} onClose={closeModal} label="Create Status Event">
          <div className="flex flex-col space-y-4">
            <div
              style={{
                backgroundColor: color ? color.background : undefined,
                color: color ? color.foreground : undefined,
              }}
              className={clsx(
                "group flex flex-col p-2 rounded-lg",
                !color && "bg-neutral-100"
              )}
            >
              <p className="font-bold">{event.summary}</p>
              {event.start && event.end && (
                <p className="text-sm">
                  {formatDateTime(event.start, false)} -{" "}
                  {formatDateTime(event.end, false)}
                </p>
              )}
            </div>
            <StatusEventCreateForm
              event={event}
              onSubmit={handleStatusEventCreate}
              onCancel={closeModal}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};
