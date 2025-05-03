"use client"

import { format, addDays, startOfWeek, isSameDay, isToday, startOfDay } from "date-fns"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { CalendarIcon } from "@/components/ui/icons"
import { DateSelectorProps } from "@/lib/types"
import { Button } from "@/components/ui/button"
/**
 * Component for selecting a date within a week view.
 */
export function DateSelector({
  currentDate,
  selectedDate,
  today,
  maxBookingDate,
  onDateSelect,
  onPrevWeek,
  onNextWeek,
  canGoPrevious,
  canGoNext
}: DateSelectorProps) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-gray-900 dark:text-white">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
            Select Date & Time
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Week of {format(startDate, "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onPrevWeek}
            disabled={!canGoPrevious}
            aria-label="Previous week"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              canGoPrevious
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={onNextWeek}
            disabled={!canGoNext}
            aria-label="Next week"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              canGoNext
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const isPast = date < startOfDay(today) && !isToday(date)
          const isTooFar = date > maxBookingDate
          const isDisabled = isPast || isTooFar
          const isCurrentDay = isToday(date)

          return (
            <button
                key={date.toISOString()}
                onClick={() => !isDisabled && onDateSelect(date)}
                disabled={isDisabled}
                aria-label={`${format(date, "EEEE, MMMM d")}${isDisabled ? ", unavailable" : ""}`}
                aria-selected={isSameDay(date, selectedDate)}
                className={`h-[84px] w-full cursor-pointer rounded-2xl transition-all flex flex-col items-center justify-center ${
                    isSameDay(date, selectedDate)
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(107,70,193,0.2)]"
                    : isDisabled
                        ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-600"
                        : isCurrentDay
                        ? "bg-white text-gray-700 hover:bg-gray-50 dark:border-purple-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                >
                <span className="text-xs font-medium">{format(date, "EEE")}</span>
                <span className="font-serif text-lg font-normal">{format(date, "d")}</span>
                {isCurrentDay && (
                    <div
                    className={`mt-1 h-2 w-2 rounded-full ${
                        isSameDay(date, selectedDate) ? "bg-white" : "bg-purple-600"
                    }`}
                    />
                )}
            </button>

          )
        })}
      </div>

      {/* Booking Notice */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <AlertCircle className="h-3 w-3" />
        <span>You can book interviews up to 14 days in advance</span>
      </div>
    </>
  )
}
