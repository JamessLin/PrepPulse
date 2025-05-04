"use client"

import { X } from "lucide-react"
import { CalendarIcon, ClockIcon, CheckIcon } from "@/components/ui/icons"
import { format } from "date-fns"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  interviewType: string
  date: Date | null
  time: string | null
}

export function ConfirmationModal({ isOpen, onClose, interviewType, date, time }: ConfirmationModalProps) {
  if (!isOpen || !date || !time) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 " onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl animate-scale-up rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-800 sm:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <CheckIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">🎉 You're booked!</h2>
          <p className="mt-2 font-sans text-gray-600 dark:text-gray-400">
            Your {interviewType} interview is scheduled for {format(date, "MMMM d, yyyy")} at {time}
          </p>
        </div>

        {/* Interview details */}
        <div className="mb-6 rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{format(date, "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                <ClockIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                <p className="font-medium text-gray-900 dark:text-white">{time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* How Matching Works */}
        <div className="mb-6">
          <h3 className="mb-4 font-sans text-xl font-medium text-gray-900 dark:text-white">
            Here's what to prepare...
          </h3>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <span className="font-sans text-sm font-medium text-purple-600 dark:text-purple-400">1</span>
              </div>
              <div>
                <h4 className="font-sans font-medium text-gray-900 dark:text-white">Check your email</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll send you a confirmation with a link to your interview room
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <span className="font-sans text-sm font-medium text-purple-600 dark:text-purple-400">2</span>
              </div>
              <div>
                <h4 className="font-sans font-medium text-gray-900 dark:text-white">Prepare your questions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You'll take turns interviewing each other, so have some questions ready
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <span className="font-sans text-sm font-medium text-purple-600 dark:text-purple-400">3</span>
              </div>
              <div>
                <h4 className="font-sans font-medium text-gray-900 dark:text-white">Test your equipment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Make sure your camera and microphone are working properly
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <span className="font-sans text-sm font-medium text-purple-600 dark:text-purple-400">4</span>
              </div>
              <div>
                <h4 className="font-sans font-medium text-gray-900 dark:text-white">Join on time</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Be ready 5 minutes before your scheduled time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <a
            href="/dashboard"
            className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-center font-medium text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-xl hover:shadow-purple-600/30"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
