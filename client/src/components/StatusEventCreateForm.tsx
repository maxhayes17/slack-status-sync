import {
  Button,
  Field,
  Fieldset,
  Input,
  Label,
  Legend,
} from "@headlessui/react";
import { CalendarEvent, Emoji } from "../utils/types";
import { formatDateTime } from "../utils/date";
import { StatusEvent } from "../utils/types";
import { useEffect, useState } from "react";
import { ButtonPrimary } from "./ButtonPrimary";
import { getSlackEmojis } from "../utils/utils";
import { EmojiSelect } from "./EmojiSelect";

type StatusEventCreateFormProps = {
  event: CalendarEvent;
  onSubmit: (statusEvent: Partial<StatusEvent>) => void;
  onCancel: () => void;
};
export const StatusEventCreateForm = ({
  event,
  onSubmit,
  onCancel,
}: StatusEventCreateFormProps) => {
  const INITIAL_STATUS_EVENT: Partial<StatusEvent> = {
    calendar_id: event.calendar_id,
    event_id: event.id,
    start: event.start,
    end: event.end,
  };

  const [statusEvent, setStatusEvent] =
    useState<Partial<StatusEvent>>(INITIAL_STATUS_EVENT);

  const [slackEmojis, setSlackEmojis] = useState<Emoji[] | null>(null);
  const getSlackEmojiData = async () => {
    const resp = await getSlackEmojis();
    setSlackEmojis(resp);
  };

  const handleChange = (
    key: keyof StatusEvent,
    value: string | Emoji | undefined
  ) => {
    setStatusEvent({ ...statusEvent, [key]: value });
  };

  useEffect(() => {
    getSlackEmojiData();
  }, []);

  const isValid = statusEvent.status_text;

  return (
    <Fieldset className="grid grid-cols-3 gap-6">
      <Legend className="col-span-full text-lg font-bold">
        Status Details
      </Legend>
      <Field className={"col-span-2"}>
        <Label className="ml-1 font-bold">* Status Text</Label>
        <Input
          className="w-full py-2 rounded-lg border-none bg-neutral-100 dark:bg-neutral-800 pr-8 pl-3 text-md focus:outline-none mt-1"
          name="status_text"
          placeholder={event.summary}
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
            />
          </div>
        ) : (
          <Input
            className="w-full py-2 rounded-lg border-none bg-neutral-100 dark:bg-neutral-800 pr-8 pl-3 text-md focus:outline-none mt-1"
            name="status_emoji"
            placeholder="Loading..."
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
      <div className="col-span-full flex flex-row justify-end space-x-4">
        <Button
          onClick={onCancel}
          className="text-red-600 font-semibold hover:text-red-500"
        >
          Cancel
        </Button>
        <ButtonPrimary
          label="Create"
          onClick={() => onSubmit(statusEvent)}
          isDisabled={!isValid}
        />
      </div>
    </Fieldset>
  );
};
