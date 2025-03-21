import {
  Button,
  Field,
  Fieldset,
  Input,
  Label,
  Legend,
  Select,
} from "@headlessui/react";
import { CalendarEvent } from "../utils/types";
import { formatDateTime } from "../utils/date";
import { StatusEvent } from "../utils/types";
import { useState } from "react";
import { ButtonPrimary } from "./ButtonPrimary";

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
    calendarId: event.calendarId,
    eventId: event.id,
    start: event.start,
    end: event.end,
  };

  const [statusEvent, setStatusEvent] =
    useState<Partial<StatusEvent>>(INITIAL_STATUS_EVENT);

  const handleChange = (key: keyof StatusEvent, value: string) => {
    setStatusEvent({ ...statusEvent, [key]: value });
  };

  const isValid = statusEvent.statusText && statusEvent.statusEmoji;

  return (
    <Fieldset className="grid grid-cols-3 gap-4">
      <Legend className="col-span-full text-lg font-bold">
        Status Details
      </Legend>
      <Field className={"col-span-2"}>
        <Label className="ml-1 font-bold">Status Text</Label>
        <Input
          className="w-full py-2 rounded-lg border-none bg-neutral-100 pr-8 pl-3 text-md focus:outline-none mt-1"
          name="statusText"
          placeholder={event.summary}
          onChange={(e) => handleChange("statusText", e.target.value)}
        />
      </Field>
      <Field className={"col-span-1"}>
        <Label className="ml-1 font-bold">Status Emoji</Label>
        <Select
          className="w-full py-2 rounded-lg border-none bg-neutral-100 pr-8 pl-3 text-md focus:outline-none mt-1"
          name="statusEmoji"
          onChange={(e) => handleChange("statusEmoji", e.target.value)}
        >
          <option>😀</option>
          <option>😢</option>
          <option>😎</option>
        </Select>
      </Field>
      {statusEvent.start && statusEvent.end && (
        <Label className="col-span-full ml-1 italic">
          From {formatDateTime(statusEvent.start, false)} to{" "}
          {formatDateTime(statusEvent.end, false)}
        </Label>
      )}
      <div className="col-span-full flex flex-row justify-end space-x-4">
        <Button onClick={onCancel} className="text-red-600 font-semibold hover:text-red-500">Cancel</Button>
        <ButtonPrimary
          label="Create"
          onClick={() => onSubmit(statusEvent)}
          isDisabled={!isValid}
        />
      </div>
    </Fieldset>
  );
};
