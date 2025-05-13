"use client"

import { Mic, Video, PhoneOff, Share, Users, MoreHorizontal, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIInterviewMeetingProps {
  className?: string
}

// For the sake of home page 
export function AIInterviewMeeting({ className }: AIInterviewMeetingProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      {/* Video grid */}
      <div className="relative flex-1">
        {/* Main video - AI Interviewer */}
        <div className="relative h-[280px] w-full overflow-hidden bg-gray-50 dark:bg-gray-800">
          <div className="flex h-full w-full items-center justify-center">
            <Bot className="h-24 w-24 text-purple-200 dark:text-purple-900" />
          </div>
          <div className="absolute bottom-3 left-3 rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <div className="flex items-center">
              <div className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500"></div>
              AI Interviewer
            </div>
          </div>

          {/* Small self-view */}
          <div className="absolute right-3 top-3 h-24 w-32 overflow-hidden rounded-md border border-gray-200 bg-gray-100 shadow-md dark:border-gray-700 dark:bg-gray-700">
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <div className="absolute bottom-1 left-1 rounded-sm bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <div className="flex items-center">
                <div className="mr-1 h-1 w-1 rounded-full bg-purple-500"></div>
                You
              </div>
            </div>
          </div>

          {/* Meeting info */}
          <div className="absolute left-3 top-3 rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <div className="flex items-center">
              <span>Technical Interview</span>
              <span className="mx-1.5">•</span>
              <span>28:45</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting controls */}
      <div className="flex items-center justify-center space-x-1 border-t border-gray-100 bg-gray-50 px-2 py-2.5 dark:border-gray-800 dark:bg-gray-800/50">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          aria-label="Mute"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          aria-label="Stop video"
        >
          <Video className="h-4 w-4" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          aria-label="Share screen"
        >
          <Share className="h-4 w-4" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          aria-label="Participants"
        >
          <Users className="h-4 w-4" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <button
          className="ml-1 flex h-8 items-center justify-center rounded-full bg-purple-600 px-3 text-xs font-medium text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
          aria-label="End call"
        >
          <PhoneOff className="mr-1 h-3.5 w-3.5" />
          End
        </button>
      </div>

      <div className="border-t border-gray-100 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2 text-xs font-medium text-gray-500 dark:text-gray-400">Current Question:</span>
            <span className="max-w-[280px] truncate text-xs text-gray-700 dark:text-gray-300">
              Tell me about a challenging project you worked on...
            </span>
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-medium text-white">
            1
          </div>
        </div>
      </div>
    </div>
  )
}
