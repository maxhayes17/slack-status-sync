import { useState } from "react";
import { formatDateTime } from "../utils/date";
import { StatusEvent } from "../utils/types";
import { deleteStatusEvent, patchStatusEvent } from "../utils/utils";
import { StatusEventEditForm } from "./StatusEventEditForm";
import { Modal } from "./Modal";
import { getEmojiFromName } from "../utils/emoji";

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
    window.location.reload();
  };
  const handleStatusEventDelete = async (statusEvent: StatusEvent) => {
    console.log("Deleting status event: ", statusEvent);
    await deleteStatusEvent(statusEvent);
    closeModal();
    window.location.reload();
  };

  return (
    <div
      className="flex flex-col w-full p-2 space-y-1 rounded-lg dark:bg-neutral-800 bg-neutral-100 hover:cursor-pointer mr-2"
      onClick={openModal}
    >
      <div className="flex flex-row space-x-1 items-center">
        {event.status_emoji &&
          (event.status_emoji.path ? (
            <img
              src={event.status_emoji.path}
              alt="Emoji"
              className="w-6 h-6"
            />
          ) : (
            <span className="w-6 h-6 flex items-center justify-center text-xl">
              {getEmojiFromName(event.status_emoji.name)}
            </span>
          ))}
        <p className="font-bold">{event.status_text}</p>
      </div>
      <p className="dark:text-neutral-400 text-sm">
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
