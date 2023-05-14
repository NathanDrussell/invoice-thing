import { cn } from "~/utils/cn";
import { Icons } from "~/utils/icons";

export const Button: React.FC<
  React.ComponentProps<"button"> & { label: string; icon?: React.ReactNode }
> = ({ label, onClick, icon, ...props }) => {
  return (
    <button
      {...props}
      className="flex items-center gap-2 rounded border p-2 text-sm leading-none hover:bg-slate-100 focus:ring-1 active:bg-transparent active:ring-2 disabled:bg-neutral-100 disabled:text-neutral-300"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
};

export const inputClassName = `w-full rounded border p-2 text-sm leading-none focus:ring-1 active:bg-transparent active:ring-2`;
export const Input: React.FC<
  React.ComponentProps<"input"> & {
    label: string;
    icon?: React.ReactNode;
    wrapperClassName?: string;
  }
> = ({ label, icon, wrapperClassName, ...props }) => {
  return (
    // <div className="flex flex-col">
    <div
      className={cn(
        "relative flex items-center gap-2",
        label ? "mt-6" : "",
        wrapperClassName
      )}
    >
      {label && (
        <label className="absolute bottom-full flex items-center text-sm font-semibold">
          {icon}
          {label}
        </label>
      )}
      <input className={inputClassName} {...props} />
    </div>
    // </div>
  );
};

export const Textarea: React.FC<
  React.ComponentProps<"textarea"> & {
    label: string;
    icon?: React.ReactNode;
    wrapperClassName?: string;
  }
> = ({ label, icon, wrapperClassName, ...props }) => {
  return (
    // <div className="flex flex-col">
    <div
      className={cn(
        "relative flex items-center gap-2",
        label ? "mt-6" : "",
        wrapperClassName
      )}
    >
      {label && (
        <label className="absolute bottom-full text-sm font-semibold">
          {label}
        </label>
      )}
      {icon}
      <textarea
        rows={8}
        className="w-full resize-none rounded border p-2 text-sm leading-none focus:ring-1 active:bg-transparent active:ring-2"
        {...props}
      />
    </div>
    // </div>
  );
};

export const Modal: React.FC<{
  width?: string;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
  onClose: () => void;
  dissmissable?: boolean;
}> = ({
  width = "w-[56rem]",
  dissmissable = true,
  title,
  children,
  actions,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[99] flex justify-center bg-black bg-opacity-50 py-8 backdrop-blur-sm">
      <div
        className={cn(
          "flex h-fit max-h-full flex-col rounded bg-white p-4 shadow-lg",
          width
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{title}</h1>
          {dissmissable && (
            <button onClick={onClose}>
              <Icons.X className="h-6 w-6" />
            </button>
          )}
        </div>
        <div className="verflow-y-auto mb-4 flex flex-col">{children}</div>
        <div className="flex justify-end">{actions}</div>
      </div>
    </div>
  );
};
