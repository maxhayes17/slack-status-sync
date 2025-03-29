import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  ComboboxButton,
} from "@headlessui/react";
import { useState } from "react";
import { Emoji } from "../utils/types";
import { getEmojiFromName } from "../utils/emoji";
import clsx from "clsx";

type EmojiSelectProps = {
  emojis: Emoji[];
  onSelect: (value: Emoji | undefined) => void;
  initialValue?: Emoji;
};

export const EmojiSelect = ({
  emojis,
  onSelect,
  initialValue,
}: EmojiSelectProps) => {
  const [selectedEmoji, setSelectedEmoji] = useState<Emoji | undefined>(
    initialValue ?? undefined
  );
  const [query, setQuery] = useState("");

  // Only render top 20 emojis at a time
  const filteredEmojis =
    query === ""
      ? emojis.slice(0, 20)
      : emojis
          .filter((emoji) => {
            return emoji.name.toLowerCase().includes(query.toLowerCase());
          })
          .slice(0, 20);

  return (
    <div className="max-h-30">
      <Combobox
        value={selectedEmoji}
        onChange={(value) => {
          setSelectedEmoji(value ?? undefined);
          onSelect(value ?? undefined);
        }}
        onClose={() => setQuery("")}
      >
        <div className="relative">
          {selectedEmoji &&
            (selectedEmoji.path ? (
              <img
                src={selectedEmoji?.path}
                alt="Emoji"
                className="w-6 h-6 group absolute inset-y-0 left-0 mx-2.5 my-auto"
              />
            ) : (
              <span className="w-6 h-6 flex text-xl items-center justify-center group absolute inset-y-0 left-0 mx-2.5 my-auto">
                {getEmojiFromName(selectedEmoji.name)}
              </span>
            ))}
          <ComboboxInput
            aria-label="Emoji"
            displayValue={(emoji: Emoji | undefined) => emoji?.name || ""}
            onChange={(event) => setQuery(event.target.value)}
            className={clsx(
              "w-full py-2 rounded-lg border-none bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-100 pr-8 pl-10 text-md focus:outline-none",
              !selectedEmoji && "pl-3"
            )}
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
          className="w-[var(--input-width)] !max-h-[118px] overflow-y-auto rounded-xl border border-neutral-100 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-800 shadow-lg shadow-neutral-300 dark:shadow-black p-1 mt-2 [--anchor-gap:var(--spacing-1)] empty:invisible"
        >
          {filteredEmojis.map((emoji) => (
            <ComboboxOption
              key={emoji.name}
              value={emoji}
              className="group flex flex-row cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-neutral-200 dark:data-[focus]:bg-neutral-700 dark:text-neutral-200 overflow-hidden"
            >
              {emoji.path ? (
                <img src={emoji.path} alt="Emoji" className="w-6 h-6" />
              ) : (
                <span className="w-6 h-6 flex items-center justify-center text-xl">
                  {getEmojiFromName(emoji.name)}
                </span>
              )}
              {emoji.name}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
};
