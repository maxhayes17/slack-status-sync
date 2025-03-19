export const StatusEvent = () => {
  return (
    <div className="max-w-72 flex flex-col p-2 rounded-lg bg-neutral-100 hover:cursor-pointer hover:bg-neutral-200">
      <div className="flex flex-row space-x-1 items-center">
        <img
          src="https://statussyncer.slack.com/emoji/bowtie/46ec6f2bb0.png"
          alt="Emoji"
          className="w-6 h-6"
        />
        <p className="font-bold">Event text</p>
      </div>
      <p className="text-sm">startDateTime - endDateTime</p>
    </div>
  );
};
