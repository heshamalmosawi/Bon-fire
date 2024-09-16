import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const minYear = 1940;
  const maxYear = currentYear - 18; // Ensures the person is at least 18 years old

  // Initial month cannot be in the future or before 1940
  const initialMonth = new Date(Math.min(Math.max(new Date().getFullYear(), minYear), maxYear), new Date().getMonth(), 1);

  const [month, setMonth] = useState(initialMonth);

  // Change month forward or backward
  const changeMonth = (offset: number) => {
    let newMonth = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    if (newMonth.getFullYear() > maxYear || newMonth.getFullYear() < minYear) {
      return; // Prevents changing beyond the min and max year
    }
    setMonth(newMonth);
  };

  // Change year forward or backward
  const changeYear = (offset: number) => {
    let newYear = month.getFullYear() + offset;
    if (newYear > maxYear || newYear < minYear) {
      return; // Prevents changing beyond the min and max year
    }
    setMonth(new Date(newYear, month.getMonth(), 1));
  };

  // Formatting month and year for display
  const formatMonthYear = (date: Date) => {
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Custom caption component
  const CustomCaption = () => (
    <div className="flex justify-between items-center p-1">
      <button onClick={() => changeYear(-1)} className="px-1">
        <ChevronsLeft className="h-5 w-5" />
      </button>
      <button onClick={() => changeMonth(-1)} className="px-1">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div>{formatMonthYear(month)}</div>
      <button onClick={() => changeMonth(1)} className="px-1">
        <ChevronRight className="h-5 w-5" />
      </button>
      <button onClick={() => changeYear(1)} className="px-1">
        <ChevronsRight className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <DayPicker
      month={month}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      onMonthChange={setMonth}
      fromMonth={new Date(minYear, 0)} // January of minYear
      toMonth={new Date(maxYear, 11)} // December of maxYear
      components={{
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
