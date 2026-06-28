"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type { DateRange }

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  // Internal draft — only committed on Apply
  const [draft, setDraft] = React.useState<DateRange | undefined>(value)

  function handleOpenChange(next: boolean) {
    if (next) {
      // Reset draft to current committed value when opening
      setDraft(value)
    }
    setOpen(next)
  }

  function handleApply() {
    onChange?.(draft)
    setOpen(false)
  }

  function handleCancel() {
    setDraft(value)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`justify-start px-2.5 font-normal ${!value?.from ? "text-muted-foreground" : ""} ${className ?? ""}`}
        >
          <CalendarIcon />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd MMM yyyy")} –{" "}
                {format(value.to, "dd MMM yyyy")}
              </>
            ) : (
              format(value.from, "dd MMM yyyy")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={draft?.from}
          selected={draft}
          onSelect={setDraft}
          disabled={date => date > new Date()}
          numberOfMonths={2}
        />
        <div className="flex items-center justify-end gap-2 border-t p-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Batal
          </Button>
          <Button size="sm" onClick={handleApply} disabled={!draft?.from}>
            Terapkan
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
