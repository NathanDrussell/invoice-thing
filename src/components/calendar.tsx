"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

// import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/utils/cn";
import { Icons } from "~/utils/icons";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rounded border p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          // buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          // buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded"
        ),
        day_selected:
          "border-2 border-red-600 text-neutral-700 hover:text-neutral-900 focus:text-black rounded before:z-[950] before:content-['Due'] relative before:absolute before:top-0 before:left-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[-30deg] before:font-[Caveat] before:font-bold before:text-red-600 before:text-lg before:bg-white before:pr-1 before:rounded before:leading-none",
        day_today: "bg-accent text-accent-foreground border before:z-[950] before:content-['Today'] relative before:absolute before:top-0 before:left-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[-30deg] before:font-[Caveat] before:font-bold before:text-neutral-600 before:text-lg before:bg-white before:rounded before:leading-none",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <Icons.CaretLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <Icons.CaretRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
