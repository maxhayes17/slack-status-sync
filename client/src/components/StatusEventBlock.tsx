import { useState } from "react";
import { formatDateTime } from "../utils/date";
import { StatusEvent } from "../utils/types";
import { deleteStatusEvent, patchStatusEvent } from "../utils/utils";
import { StatusEventEditForm } from "./StatusEventEditForm";
import { Modal } from "./Modal";

type StatusEventBlockProps = {
  event: StatusEvent;
};
export const StatusEventBlock = ({ event }: StatusEventBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleStatusEventEdit = async (statusEvent: StatusEvent) => {
    console.log("Creating status event: ", statusEvent);
    await patchStatusEvent(statusEvent);
    closeModal();
  };
  const handleStatusEventDelete = async (statusEvent: StatusEvent) => {
    console.log("Deleting status event: ", statusEvent);
    await deleteStatusEvent(statusEvent);
    closeModal();
  };

  return (
    <div
      className="flex flex-col p-2 space-y-1 rounded-lg bg-neutral-100 hover:cursor-pointer hover:bg-neutral-200 mr-4"
      onClick={openModal}
    >
      <div className="flex flex-row space-x-2 items-center">
        {event.status_emoji && (
          <img src={event.status_emoji.path} alt="Emoji" className="w-6 h-6" />
        )}
        <p className="font-bold">{event.status_text}</p>
      </div>
      <p className="text-sm">
        {formatDateTime(event.start, false)} -{" "}
        {formatDateTime(event.end, false)}
      </p>
      <Modal isOpen={isOpen} onClose={closeModal} label="Edit Status Event">
        <StatusEventEditForm
          statusEvent={event}
          onSubmit={handleStatusEventEdit}
          onCancel={closeModal}
          onDelete={handleStatusEventDelete}
        />
      </Modal>
    </div>
  );
};
