import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col">
        <div className="left-0 top-0 z-10 p-4 flex w-full shrink-0 items-center justify-start h-16 bg-cyan-700">
            <button className="px-3 py-2 rounded-xl font-bold bg-cyan-500">
                Sign in with Google
            </button>
        </div>
        <div className="mx-auto w-full p-4 pt-8">
            {children}
        </div>
    </div>
  );
}