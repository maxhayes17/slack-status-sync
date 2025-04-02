import clsx from "clsx";

type ErrorMessageProps = {
  size?: "small" | "large";
  children?: React.ReactNode;
};
export const ErrorMessage = ({
  size = "large",
  children,
}: ErrorMessageProps) => {
  return (
    <div
      className={clsx({
        "flex flex-col col-span-full max-h-fit mx-auto text-center rounded-lg bg-red-600 bg-opacity-40 z-50":
          true,
        "w-full py-2 text-md": size === "small",
        "max-w-fit mt-12 px-8 py-4 text-lg": size === "large",
      })}
    >
      {children ? (
        children
      ) : (
        <>
          <p className="font-bold">Whoops! We encountered an Error.</p>
          <p className={clsx("text-md", { "text-sm": size === "small" })}>
            Please refresh this page and try again.
          </p>
        </>
      )}
    </div>
  );
};
