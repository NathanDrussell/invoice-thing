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

const colorClasses = {
  gray: "bg-gray-50 text-gray-800 ring-gray-600/20",
  red: "bg-red-50 text-red-800 ring-red-600/20",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  green: "bg-green-50 text-green-800 ring-green-600/20",
  blue: "bg-blue-50 text-blue-800 ring-blue-600/20",
  indigo: "bg-indigo-50 text-indigo-800 ring-indigo-600/20",
  purple: "bg-purple-50 text-purple-800 ring-purple-600/20",
  pink: "bg-pink-50 text-pink-800 ring-pink-600/20",
} as const;
export type Color = keyof typeof colorClasses;

export const Badge: React.FC<{
  children: React.ReactNode;
  color?: keyof typeof colorClasses;
}> = ({ color = "yellow", children }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        colorClasses[color]
      )}
    >
      {children}
    </span>
  );
};
