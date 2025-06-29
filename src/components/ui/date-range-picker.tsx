
"use client"

import * as React from "react"
import { format, sub, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    date: DateRange | undefined;
    onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  onDateChange
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const presets = [
    { name: "last_7_days", label: "Last 7 days" },
    { name: "last_30_days", label: "Last 30 days" },
    { name: "this_month", label: "This month" },
    { name: "last_month", label: "Last month" },
    { name: "this_year", label: "This year" },
  ];

  const handlePresetClick = (presetName: string) => {
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined = now;
    
    switch (presetName) {
        case "last_7_days":
            from = sub(now, { days: 6 });
            break;
        case "last_30_days":
            from = sub(now, { days: 29 });
            break;
        case "this_month":
            from = startOfMonth(now);
            break;
        case "last_month":
            const lastMonth = sub(now, { months: 1 });
            from = startOfMonth(lastMonth);
            to = endOfMonth(lastMonth);
            break;
        case "this_year":
            from = startOfYear(now);
            break;
        default:
            return;
    }
    
    onDateChange({ from, to });
    setIsOpen(false);
  }

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    onDateChange(selectedDate);
    // Close the popover only when a full range is selected
    if (selectedDate?.from && selectedDate?.to) {
      if (selectedDate.from.getTime() !== selectedDate.to.getTime()) {
         setIsOpen(false);
      }
    }
  }


  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align="end">
          <div className="flex flex-col space-y-1 p-2 border-r">
            <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Presets</span>
            {presets.map((preset) => (
                <Button key={preset.name} variant="ghost" size="sm" className="justify-start" onClick={() => handlePresetClick(preset.name)}>
                    {preset.label}
                </Button>
            ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
