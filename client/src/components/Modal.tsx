import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  children?: ReactNode;
};

export const Modal = ({ isOpen, onClose, label, children }: ModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-20 ">
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 bg-black bg-opacity-25">
        <DialogPanel className="flex flex-col max-w-xl space-y-4 bg-white rounded-xl p-6">
          <DialogTitle className="text-xl font-bold">{label}</DialogTitle>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};
