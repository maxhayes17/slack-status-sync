import { Button } from '@headlessui/react';

type ButtonPrimaryProps = {
    label: string;
    onClick?: () => void;
}
export const ButtonPrimary = ({ label, onClick }: ButtonPrimaryProps) => {
return <Button onClick={onClick} className="px-4 py-2 rounded-xl font-bold bg-cyan-400 hover:brightness-105 max-w-fit">{label}</Button>
}