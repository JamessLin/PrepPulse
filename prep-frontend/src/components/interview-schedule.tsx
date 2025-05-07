"use client"

import { format } from "date-fns"
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react"

// Mock data - in a real app, this would come from an API
const UPCOMING_INTERVIEWS = [
  {
    id: 1,
    type: "Technical",
    mode: "Peer to Peer",
    date: new Date(2024, 2, 15),
    time: "3:00 PM",
    partner: "John Doe",
  },
  {
    id: 2,
    type: "Behavioral",
    mode: "AI Interview",
    date: new Date(2024, 2, 16),
    time: "11:00 AM",
    partner: "AI Interviewer",
  },
]

export function InterviewSchedule() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800">
      <h2 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">Upcoming Interviews</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Here are your scheduled interview sessions
      </p>

      <div className="mt-6 space-y-4">
        {UPCOMING_INTERVIEWS.map((interview) => (
          <div
            key={interview.id}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{interview.type} Interview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{interview.mode}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(interview.date, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-4 w-4" />
                <span>{interview.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <UserIcon className="h-4 w-4" />
                <span>{interview.partner}</span>
              </div>
            </div>

            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 