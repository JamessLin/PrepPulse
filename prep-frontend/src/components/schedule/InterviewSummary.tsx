"use client"

import { format } from "date-fns"
import { User } from "lucide-react"
import { CalendarIcon, ClockIcon } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { DEFAULT_INTERVIEW_MODES } from "./InterviewModeSelector"
import { INTERVIEW_TYPES } from "./InterviewTypeSelector"

interface InterviewSummaryProps {
  selectedDate: Date
  selectedTime: string
  selectedMode: string
  selectedType: string
  friendEmail: string
}

export function InterviewSummary({
  selectedDate,
  selectedTime,
  selectedMode,
  selectedType,
  friendEmail,
}: InterviewSummaryProps) {
  // Get the selected mode and type objects
  const selectedModeObj = DEFAULT_INTERVIEW_MODES.find((mode) => mode.id === selectedMode)
  const selectedTypeObj = INTERVIEW_TYPES.find((type) => type.id === selectedType)

  return (
    <div className="mt-6">
  

      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
        {/* Header with subtle accent */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 px-4 py-3">
          <div className="flex items-center">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center mr-3",
                selectedMode === "ai"
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : selectedMode === "friend"
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : "bg-purple-50 dark:bg-purple-900/20",
              )}
            >
              {selectedTypeObj?.icon || (
                <User
                  className={cn(
                    "h-4 w-4",
                    selectedMode === "ai"
                      ? "text-blue-600 dark:text-blue-400"
                      : selectedMode === "friend"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-purple-600 dark:text-purple-400",
                  )}
                />
              )}
            </div>
            <div>
              <h4 className="font-serif text-sm font-normal text-gray-900 dark:text-white">
                {selectedTypeObj?.name || "Technical"} Interview
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedModeObj?.name || "Peer to Peer"}
                {selectedMode === "friend" && friendEmail && ` with ${friendEmail}`}
              </p>
            </div>

            {/* Mode badge */}
            <div className="ml-auto">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs",
                  selectedMode === "ai"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : selectedMode === "friend"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
                )}
              >
                {selectedModeObj?.name || "Peer to Peer"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center mr-3 border border-gray-100 dark:border-gray-700">
                <CalendarIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                <p className="text-sm text-gray-900 dark:text-white">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center mr-3 border border-gray-100 dark:border-gray-700">
                <ClockIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedTime} <span className="text-xs text-gray-500 dark:text-gray-400">(60 minutes)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-start rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {selectedMode === "peer"
                  ? "You'll be matched with another peer who joins at the same time. Be ready 5 minutes before your scheduled time."
                  : selectedMode === "ai"
                    ? "Our AI interviewer will guide you through a realistic interview experience with personalized feedback."
                    : "Your friend will receive an email invitation to join your interview session at the scheduled time."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
