"use client"

import { format } from "date-fns"
import { CalendarIcon, Check } from "lucide-react"
import { ClockIcon } from "@/components/ui/icons"
import { TimeSelectorProps, TimeSlot } from "@/lib/types"

/**
 * Hard‑coded interview time slots.
 * NOTE: Move this to remote config or CMS if you need dynamic slots.
 */
const TIME_SLOTS = ["7:00 AM", "11:00 AM", "3:00 PM", "9:00 PM"]

/**
 * getAvailableSlots – Computes the enabled / disabled state for every slot on a
 * given date. A slot is disabled when it starts < 60 min from NOW (user's
 * local time), or when the day is in the past.
 */
function getAvailableSlots(date: Date): TimeSlot[] {
  const now = new Date()

  return TIME_SLOTS.map((slot) => {
    const [hourStr, minutePart] = slot.split(":")
    const hour = parseInt(hourStr, 10)
    const minute = parseInt(minutePart.split(" ")[0], 10)
    const isPM = slot.toLowerCase().includes("pm")

    const slotDate = new Date(date)
    slotDate.setHours(
      // convert 12‑hour → 24‑hour keeping 12 AM / 12 PM edge‑cases in mind
      isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour,
    )
    slotDate.setMinutes(minute)
    slotDate.setSeconds(0)
    slotDate.setMilliseconds(0)

    // Disable when slot starts less than 1 h from now
    const isDisabled = slotDate.getTime() - now.getTime() < 60 * 60 * 1000

    return { time: slot, disabled: isDisabled }
  })
}



/**
 * TimeSlotSelector – Shows the same slot‑selection UI but also handles the
 * "no date selected" empty‑state when embedded under a calendar.
 *
 * The business / disable logic is shared with TimeSelector via
 * getAvailableSlots for consistency.
 */
export function TimeSlotSelector({ selectedDate, selectedTime, onTimeSelect }: TimeSelectorProps) {
  // 1. Empty state when user hasn't picked a date yet
  if (!selectedDate) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl bg-gray-50 p-8 text-center dark:bg-gray-800/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="mt-4 font-serif text-xl font-normal text-gray-900 dark:text-white">
          Select a date
        </h3>
        <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
          Choose a date from the calendar above to see available interview time slots
        </p>
      </div>
    )
  }

  // 2. Once a date is chosen → compute slot availability
  const availableSlots = getAvailableSlots(selectedDate)

  return (
    
    <div className="mt-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-normal text-gray-900 dark:text-white">
          Available times for {format(selectedDate, "MMMM d, yyyy")}:
        </h3>
        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
          {availableSlots.filter((slot) => !slot.disabled).length} slots available
        </span>
      </div>

      {/* Slots grid */}
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
    </div>
  )
}
