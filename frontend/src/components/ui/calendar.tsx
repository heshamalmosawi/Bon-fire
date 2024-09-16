import * as React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  // Define the initial and constraining years
  const minYear = 1940;
  const maxYear = new Date().getFullYear() - 18; // Ensures the person is at least 18 years old


  const initialDate = new Date(2000, 8, 1); 

  // Set initial month state
  const [month, setMonth] = useState(initialDate);

  // Adjust month navigation to ensure it stays within bounds
  const changeMonth = (offset: number) => {
    let newMonth = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    if (newMonth.getFullYear() > maxYear || newMonth.getFullYear() < minYear) {
      return; // Prevents changing beyond the min and max year
    }
    setMonth(newMonth);
  };

  // Adjust year navigation to ensure it stays within bounds
  const changeYear = (offset: number) => {
    let newYear = month.getFullYear() + offset;
    if (newYear > maxYear || newYear < minYear) {
      return; // Prevents changing beyond the min and max year
    }
    setMonth(new Date(newYear, month.getMonth(), 1));
  };

  // Format the display of month and year in the caption
  const formatMonthYear = (date: Date) => {
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Custom caption component for navigation
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
      className={`p-4 border border-gray-200 rounded-lg shadow ${className}`}
      onMonthChange={setMonth}
      fromMonth={new Date(minYear, 0)}
      toMonth={new Date(maxYear, 11)}
      components={{
        Caption: CustomCaption,
      }}
      modifiersStyles={{
        outside: { color: '#aaa' }, // Styles for days outside the current month
        today: { color: 'red' },     // Styles for today's date
      }}
      classNames={{
        day: 'p-2 hover:bg-blue-100',       // Tailwind classes for day cells

      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
