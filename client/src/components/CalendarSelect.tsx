import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton,
} from "@headlessui/react";
import { useState } from "react";
import { Calendar } from "../utils/types";

type CalendarSelectProps = {
  calendars: Calendar[];
  label: string;
  onSelect: (value: Calendar) => void;
};

export const CalendarSelect = ({
  calendars,
  label,
  onSelect,
}: CalendarSelectProps) => {
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar>(
    calendars[0]
  );
  const [query, setQuery] = useState("");

  const filteredCalendars =
    query === ""
      ? calendars
      : calendars.filter((calendar) => {
          return calendar.summary.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div className="flex flex-col max-w-60 space-y-1">
      <p className="font-bold pl-1">{label}</p>
      <Combobox
        value={selectedCalendar}
        onChange={(value) => {
          setSelectedCalendar(value ?? calendars[0]);
          onSelect(value ?? calendars[0]);
        }}
        onClose={() => setQuery("")}
      >
        <div className="relative">
          <ComboboxInput
            aria-label="Calendar"
            displayValue={(calendar: Calendar) => calendar?.summary}
            onChange={(event) => setQuery(event.target.value)}
            className={
              "w-full py-2 rounded-lg border-none bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-100 pr-8 pl-3 text-md focus:outline-none"
            }
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            {/* Down chevron */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </ComboboxButton>
        </div>
        <ComboboxOptions
          anchor="bottom"
          className="w-[var(--input-width)] rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-lg shadow-neutral-300 dark:shadow-black bg-neutral-100 dark:bg-neutral-800 p-1 mt-2 [--anchor-gap:var(--spacing-1)] empty:invisible"
        >
          {filteredCalendars.map((calendar) => (
            <ComboboxOption
              key={calendar.id}
              value={calendar}
              className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-neutral-200 dark:data-[focus]:bg-neutral-700 dark:text-neutral-300"
            >
              {/* Checkbox */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 invisible group-data-[selected]:visible dark:stroke-neutral-100"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
              {calendar.summary}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
};
