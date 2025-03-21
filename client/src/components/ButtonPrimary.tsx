import { Button } from '@headlessui/react';

type ButtonPrimaryProps = {
    label: string;
    onClick?: () => void;
    isDisabled?: boolean;
}
export const ButtonPrimary = ({ label, onClick, isDisabled }: ButtonPrimaryProps) => {
    return isDisabled ? (
        <Button className="px-4 py-2 rounded-xl font-bold bg-neutral-300 max-w-fit" disabled>{label}</Button>
    ) : (
        <Button onClick={onClick} className="px-4 py-2 rounded-xl font-bold bg-cyan-400 hover:brightness-105 max-w-fit">{label}</Button>
    )
}