import { Button, Field, Fieldset, Input, Label } from "@headlessui/react";
import { Emoji } from "../utils/types";
import { formatDateTime } from "../utils/date";
import { StatusEvent } from "../utils/types";
import { useEffect, useState } from "react";
import { ButtonPrimary } from "./ButtonPrimary";
import { getSlackEmojis } from "../utils/utils";
import { EmojiSelect } from "./EmojiSelect";

type StatusEventEditFormProps = {
  statusEvent: StatusEvent;
  onSubmit: (statusEvent: StatusEvent) => void;
  onCancel: () => void;
  onDelete: (statusEvent: StatusEvent) => void;
};
export const StatusEventEditForm = ({
  statusEvent,
  onSubmit,
  onCancel,
  onDelete,
}: StatusEventEditFormProps) => {
  const [updatedStatusEvent, setUpdatedStatusEvent] =
    useState<StatusEvent>(statusEvent);

  const [slackEmojis, setSlackEmojis] = useState<Emoji[] | null>(null);
  const getSlackEmojiData = async () => {
    const resp = await getSlackEmojis();
    setSlackEmojis(resp);
  };

  const handleChange = (
    key: keyof StatusEvent,
    value: string | Emoji | undefined
  ) => {
    setUpdatedStatusEvent({ ...updatedStatusEvent, [key]: value });
  };


  // In dev Strict Mode, React components will mount/unmount/remount by design, which means effects will run twice.
  // use a local variable to track if the component is mounted to avoid fetching twice.
  let isMounted = false;
  
  useEffect(() => {
    if (!isMounted) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isMounted = true;
      getSlackEmojiData();
    }
  }, []);

  const isValid =
    statusEvent.status_text !== updatedStatusEvent.status_text ||
    statusEvent.status_emoji?.name !== updatedStatusEvent.status_emoji?.name;

  return (
    <Fieldset className="grid grid-cols-3 gap-6">
      <Field className={"col-span-2"}>
        <Label className="ml-1 font-bold">* Status Text</Label>
        <Input
          className="w-full py-2 rounded-lg border-none bg-neutral-100 dark:bg-neutral-800 text-neutral-100 pr-8 pl-3 text-md focus:outline-none mt-1"
          name="status_text"
          value={updatedStatusEvent.status_text}
          placeholder={statusEvent.status_text}
          onChange={(e) => handleChange("status_text", e.target.value)}
        />
      </Field>
      <Field className={"col-span-1"}>
        <Label className="ml-1 font-bold">Status Emoji</Label>
        {slackEmojis ? (
          <div className="mt-1">
            <EmojiSelect
              emojis={slackEmojis}
              onSelect={(emoji) => handleChange("status_emoji", emoji)}
              initialValue={statusEvent.status_emoji}
            />
          </div>
        ) : (
          <Input
            className="w-full py-2 rounded-lg border-none bg-neutral-100 dark:bg-neutral-800 pr-8 pl-3 text-md focus:outline-none mt-1"
            name="status_emoji"
            disabled
          />
        )}
      </Field>
      {statusEvent.start && statusEvent.end && (
        <Label className="col-span-full ml-1 italic dark:text-neutral-400">
          From {formatDateTime(statusEvent.start, false)} to{" "}
          {formatDateTime(statusEvent.end, false)}
        </Label>
      )}
      <div className="flex flex-row col-span-full justify-between">
        <Button
          onClick={() => onDelete(updatedStatusEvent)}
          className="bg-red-600 font-semibold text-white px-3 py-2 rounded-lg"
        >
          Delete
        </Button>
        <div className="flex flex-row justify-end space-x-4">
          <Button
            onClick={onCancel}
            className="text-red-600 font-semibold hover:text-red-500"
          >
            Cancel
          </Button>
          <ButtonPrimary
            label="Update"
            onClick={() => onSubmit(updatedStatusEvent)}
            isDisabled={!isValid}
          />
        </div>
      </div>
    </Fieldset>
  );
};
