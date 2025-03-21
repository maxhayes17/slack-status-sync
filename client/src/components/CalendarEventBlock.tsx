import { useState } from "react";
import { CalendarEvent, StatusEvent } from "../utils/types";
import { Modal } from "./Modal";
import { StatusEventCreateForm } from "./StatusEventCreateForm";
import { formatDateTime } from "../utils/date";
import { postStatusEvent } from "../utils/utils";
import { Button } from "@headlessui/react";

type CalendarEventBlockProps = {
  event: CalendarEvent;
};
export const CalendarEventBlock = ({ event }: CalendarEventBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleStatusEventCreate = async (statusEvent: Partial<StatusEvent>) => {
    console.log("Creating status event: ", statusEvent);
    await postStatusEvent(statusEvent);
    closeModal();
  };

  return (
    <div className="group flex flex-col p-2 rounded-lg bg-neutral-100 hover:cursor-pointer hover:bg-neutral-200">
      <div className="flex flex-row space-x-2 items-center">
        <p className="font-bold">{event.summary}</p>
        <Button
          className="text-blue-600 font-bold invisible group-hover:visible hover:text-blue-500 pr-4"
          onClick={openModal}
        >
          Add Status
        </Button>
      </div>
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
          <div className="group flex flex-col p-2 rounded-lg bg-neutral-100">
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
  );
};
