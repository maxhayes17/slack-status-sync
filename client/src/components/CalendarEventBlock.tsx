import { useState } from "react";
import { CalendarColor, CalendarEvent, StatusEvent } from "../utils/types";
import { Modal } from "./Modal";
import { StatusEventCreateForm } from "./StatusEventCreateForm";
import { formatDateTime } from "../utils/date";
import { postStatusEvent } from "../utils/utils";
import { Button } from "@headlessui/react";
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

  const handleStatusEventCreate = async (statusEvent: Partial<StatusEvent>) => {
    console.log("Creating status event: ", statusEvent);
    await postStatusEvent(statusEvent);
    closeModal();
  };

  return (
    <div
      style={{
        backgroundColor: color ? color.background : undefined,
        color: color ? color.foreground : undefined,
      }}
      className={clsx(
        "group flex flex-row justify-between p-2 rounded-lg w-2/3",
        color ? "hover:bg-opacity-70" : "bg-neutral-100 hover:bg-neutral-200"
      )}
    >
      <div className="flex flex-col">
        <p className="font-bold">{event.summary}</p>
        {event.start &&
          event.end &&
          (event.allDay ? (
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
      <div className="flex flex-col my-auto">
        <Button
          className="px-2 py-1 bg-neutral-100 rounded-lg text-blue-600 font-bold invisible group-hover:visible hover:text-blue-500"
          onClick={openModal}
        >
          Add Status
        </Button>
      </div>
    </div>
  );
};
