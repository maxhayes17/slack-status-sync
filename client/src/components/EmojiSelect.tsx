import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton,
} from "@headlessui/react";
import { useState } from "react";
import { Emoji } from "../utils/types";

type EmojiSelectProps = {
  emojis: Emoji[];
  onSelect: (value: Emoji) => void;
  initialValue?: Emoji;
};

export const EmojiSelect = ({
  emojis,
  onSelect,
  initialValue,
}: EmojiSelectProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState<Emoji>(
    initialValue ?? emojis[0]
  );
  const [query, setQuery] = useState("");

  const filteredEmojis =
    query === ""
      ? emojis
      : emojis.filter((emoji) => {
          return emoji.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div className="max-h-30">
      <Combobox
        value={selectedEmoji}
        onChange={(value) => {
          setSelectedEmoji(value ?? emojis[0]);
          onSelect(value ?? emojis[0]);
        }}
        onClose={() => setQuery("")}
      >
        <div className="relative">
          <img
            src={selectedEmoji.path}
            alt="Emoji"
            className="w-6 h-6 group absolute inset-y-0 left-0 mx-2.5 my-auto"
          />
          <ComboboxInput
            aria-label="Emoji"
            displayValue={(emoji: Emoji) => emoji.name}
            onChange={(event) => setQuery(event.target.value)}
            className={
              "w-full py-2 rounded-lg border-none bg-neutral-100 pr-8 pl-10 text-md focus:outline-none"
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
          className="w-[var(--input-width)] !max-h-[118px] overflow-y-auto rounded-xl border border-neutral-100 bg-neutral-100 p-1 mt-2 [--anchor-gap:var(--spacing-1)] empty:invisible"
        >
          {filteredEmojis.map((emoji) => (
            <ComboboxOption
              key={emoji.name}
              value={emoji}
              className="group flex flex-row cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-neutral-200"
            >
              <img src={emoji.path} alt="Emoji" className="w-6 h-6" />
              {emoji.name}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
};
