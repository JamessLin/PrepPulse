"use client"

import type React from "react"

import { Check, X } from "lucide-react"
import { CheckIcon } from "@/components/ui/icons"

interface ScheduleActionsProps {
  selectedDate: Date | null
  selectedTime: string | null
  isScheduling: boolean
  isScheduled: boolean
  selectedMode: string
  friendEmail: string
  onCancel: () => void
  onSchedule: () => void
  showFeedbackOption: boolean
  wantsFeedback: boolean
  onFeedbackOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ScheduleActions({
  selectedDate,
  selectedTime,
  isScheduling,
  isScheduled,
  selectedMode,
  friendEmail,
  onCancel,
  onSchedule,
  showFeedbackOption,
  wantsFeedback,
  onFeedbackOptionChange,
}: ScheduleActionsProps) {
  return (
    <div className="mt-8 flex flex-col border-t pt-6">
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="rounded-full border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <X className="mr-2 inline-block h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={onSchedule}
          disabled={
            !selectedDate || !selectedTime || isScheduling || isScheduled || (selectedMode === "friend" && !friendEmail)
          }
          className={`relative rounded-full px-8 py-2.5 font-medium transition-all ${
            selectedDate &&
            selectedTime &&
            !isScheduling &&
            !isScheduled &&
            !(selectedMode === "friend" && !friendEmail)
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(107,70,193,0.3)] hover:shadow-[0_6px_20px_rgba(107,70,193,0.4)]"
              : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {isScheduling ? (
            <span className="flex items-center justify-center">
              <svg
                className="mr-2 h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Scheduling...
            </span>
          ) : isScheduled ? (
            <span className="flex items-center justify-center">
              <Check className="mr-2 h-4 w-4" />
              Scheduled!
            </span>
          ) : (
            <>
              <CheckIcon className="mr-2 inline-block h-4 w-4" />
              Schedule Interview
            </>
          )}
        </button>
      </div>

      {/* Feedback Option */}
      {showFeedbackOption && (
        <div className="mt-4 animate-fadeIn self-end rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
          <label className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
            <input
              type="checkbox"
              checked={wantsFeedback}
              onChange={onFeedbackOptionChange}
              className="h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
            />
            Would you like to give or receive feedback after the interview?
          </label>
        </div>
      )}
    </div>
  )
}
