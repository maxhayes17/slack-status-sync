import { Button } from '@headlessui/react';

type ButtonPrimaryProps = {
    label: string;
    onClick?: () => void;
    isDisabled?: boolean;
}
export const ButtonPrimary = ({ label, onClick, isDisabled }: ButtonPrimaryProps) => {
    return isDisabled ? (
        <Button className="px-4 py-2 rounded-lg font-bold bg-neutral-300 text-neutral-600 max-w-fit max-h-fit" disabled>{label}</Button>
    ) : (
        <Button onClick={onClick} className="px-4 py-2 rounded-lg font-bold bg-blue-500 text-white hover:brightness-105 max-w-fit max-h-16">{label}</Button>
    )
}