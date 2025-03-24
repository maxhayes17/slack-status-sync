import { ButtonAddToSlack } from "./ButtonAddToSlack";
import { ButtonPrimary } from "./ButtonPrimary";
import { Modal } from "./Modal";

type ModalHowItWorksProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ModalHowItWorks = ({ isOpen, onClose }: ModalHowItWorksProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      label="How to use Slack Status Syncer"
    >
      <div className="flex flex-col space-y-4">
        <ul className="list-none list-inside space-y-6">
          <li className="flex flex-col space-y-2">
            <p className="flex flex-row items-center">
              Add the app to your Slack workspace by clicking{" "}
              <span className="ml-2">
                <ButtonAddToSlack />
              </span>
            </p>
            <p className="text-sm text-neutral-600 italic">
              This allows the Status Syncer to make real-time updates to your
              status in Slack
            </p>
          </li>
          <li className="flex flex-col space-y-2">
            <p>
              Choose an event from one of your calendars, and click{" "}
              <span className="ml-1">
                <ButtonPrimary label="Add Status" />
              </span>
            </p>
            <p className="text-sm text-neutral-600 italic">
              **Only one-time events are supported for status syncs. If you
              choose a recurring event, the status will stop syncing after the
              first occurrence.
            </p>
          </li>
          <li className="flex flex-col space-y-2">
            <p className="leading-loose">
              Choose the status text, and optionally an emoji from your Slack
              workspace for the event, and click{" "}
              <span className="ml-1 leading-normal">
                <ButtonPrimary label="Create" />
              </span>
            </p>
            <p className="text-sm text-neutral-600 italic">
              Status events can be updated until the event starts. After the
              event starts, no changes to the status event will be reflected in
              Slack.
            </p>
          </li>
          <li className="py-0">
            Watch as your status changes in Slack while the event occurs! 🎉
          </li>
        </ul>
        <div className="flex flex-row justify-center">
          <ButtonPrimary label="Got it!" onClick={onClose} />
        </div>
      </div>
    </Modal>
  );
};
