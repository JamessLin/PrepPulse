"use client"

import { format, isSameDay, isAfter, isBefore, isToday, addDays, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { CalendarIcon } from "@/components/ui/icons"

interface DateSelectorProps {
  currentDate: Date
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  onPrevWeek: () => void
  onNextWeek: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  maxBookingDays: number
}

export function DateSelector({
  currentDate,
  selectedDate,
  onDateSelect,
  onPrevWeek,
  onNextWeek,
  canGoPrevious,
  canGoNext,
  maxBookingDays,
}: DateSelectorProps) {
  const TODAY = new Date()
  TODAY.setHours(0, 0, 0, 0)
  const MAX_BOOKING_DATE = addDays(TODAY, maxBookingDays)

  // Generate dates for the week view
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-lg font-normal text-gray-900 dark:text-white">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
            Select Date & Time
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Week of {format(startDate, "MMMM d, yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPrevWeek}
            disabled={!canGoPrevious}
            aria-label="Previous week"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              canGoPrevious
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNextWeek}
            disabled={!canGoNext}
            aria-label="Next week"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              canGoNext
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="mb-2 grid grid-cols-7 gap-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const isPastDate = isBefore(date, TODAY) && !isToday(date)
          const isFutureLimit = isAfter(date, MAX_BOOKING_DATE)
          const isDisabled = isPastDate || isFutureLimit
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
          const isCurrentDay = isToday(date)

          return (
            <button
              key={date.toString()}
              onClick={() => !isDisabled && onDateSelect(date)}
              disabled={isDisabled}
              aria-label={`${format(date, "EEEE, MMMM d")}${isDisabled ? ", unavailable" : ""}`}
              aria-selected={isSelected}
              className={`relative flex flex-col items-center justify-center rounded-xl py-3 transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(107,70,193,0.2)]"
                  : isDisabled
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600"
                    : isCurrentDay
                      ? "border-2 border-purple-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-purple-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                      : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-xs font-medium">{format(date, "EEE")}</span>
              <span className="font-serif text-lg font-normal">{format(date, "d")}</span>
              {isCurrentDay && !isSelected && (
                <span className="absolute -top-1 right-1 rounded-full bg-purple-600 px-1.5 py-0.5 text-[8px] font-medium text-white">
                  Today
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Booking window notice */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <AlertCircle className="h-3 w-3" />
        <span>You can book interviews up to {maxBookingDays} days in advance</span>
      </div>
    </div>
  )
}
