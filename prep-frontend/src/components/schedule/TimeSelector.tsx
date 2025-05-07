"use client"

import { format } from "date-fns"
import { Check } from "lucide-react"
import { ClockIcon } from "@/components/ui/icons"
import { TimeSelectorProps, TimeSlot } from "@/lib/types"

const TIME_SLOTS = ["7:00 AM", "11:00 AM", "3:00 PM", "9:00 PM"]

/**
 * Get available time slots for a given date.
 */
function getAvailableSlots(date: Date): TimeSlot[] {
  const now = new Date()

  return TIME_SLOTS.map((slot) => {
    const [hourStr, minutePart] = slot.split(":")
    const hour = parseInt(hourStr, 10)
    const minute = parseInt(minutePart.split(" ")[0], 10)
    const isPM = slot.toLowerCase().includes("pm")

    const slotDate = new Date(date)
    slotDate.setHours(isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour)
    slotDate.setMinutes(minute)
    slotDate.setSeconds(0)
    slotDate.setMilliseconds(0)

    const isDisabled = slotDate.getTime() - now.getTime() < 60 * 60 * 1000

    return { time: slot, disabled: isDisabled }
  })
}

/**
 * TimeSelector – renders available time slots for a selected date.
 */
export function TimeSelector({ selectedDate, selectedTime, onTimeSelect }: TimeSelectorProps) {
  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : []

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-normal text-gray-900 dark:text-white">
          Available times for {format(selectedDate, "MMMM d, yyyy")}:
        </h3>
        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
          {availableSlots.filter(slot => !slot.disabled).length} slots available
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {availableSlots.length > 0 ? (
          availableSlots.map(({ time, disabled }) => (
            <button
              key={time}
              onClick={() => !disabled && onTimeSelect(time)}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 transition-all ${
                selectedTime === time
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(107,70,193,0.2)]"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ClockIcon className="h-4 w-4" />
              <span className="text-sm">{time}</span>
            </button>
          ))
        ) : (
          <p className="col-span-full rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            No available slots for this date. Please select another date.
          </p>
        )}
      </div>

      {/* Selection Summary */}
      {selectedTime && (
        <div className="mt-6 rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300">
            <Check className="h-4 w-4" />
            <span>
              Selected: {format(selectedDate, "MMMM d, yyyy")} at {selectedTime}
            </span>
          </div>
          <p className="mt-1 text-xs text-purple-600/70 dark:text-purple-400/70">
            You'll be matched with a peer who's available at the same time
          </p>
        </div>
      )}
    </div>
  )
}