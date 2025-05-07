"use client"

import { Users, Bot, UserPlus, Mail } from "lucide-react"
import { User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface InterviewMode {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  lightColor: string
  darkColor: string
  badge?: string
}

interface InterviewModeSelectorProps {
  modes: InterviewMode[]
  selectedMode: string
  onSelectMode: (modeId: string) => void
  friendEmail?: string
  onFriendEmailChange?: (email: string) => void
}

export function InterviewModeSelector({
  modes,
  selectedMode,
  onSelectMode,
  friendEmail = "",
  onFriendEmailChange
}: InterviewModeSelectorProps) {
  return (
    <>
      {/* Heading */}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-serif text-lg font-normal text-gray-900 dark:text-white">
          <User className="h-5 w-5 text-purple-600" />
          Interview Mode
        </h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Choose who you want to practice with
        </p>
      </div>

      {/* Segmented control for interview modes */}
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-700/50">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-xs font-medium transition-all",
              selectedMode === mode.id
                ? `bg-white shadow-sm dark:bg-gray-800 text-${mode.id === "peer" ? "purple" : mode.id === "ai" ? "blue" : "emerald"}-600 dark:text-${mode.id === "peer" ? "purple" : mode.id === "ai" ? "blue" : "emerald"}-400`
                : "text-gray-600 hover:bg-gray-50/50 dark:text-gray-400 dark:hover:bg-gray-700/50"
            )}
          >
            <div
              className={cn(
                "mb-1 flex h-7 w-7 items-center justify-center rounded-full",
                selectedMode === mode.id
                  ? `bg-${mode.id === "peer" ? "purple" : mode.id === "ai" ? "blue" : "emerald"}-100 text-${mode.id === "peer" ? "purple" : mode.id === "ai" ? "blue" : "emerald"}-600 dark:bg-${mode.id === "peer" ? "purple" : mode.id === "ai" ? "blue" : "emerald"}-900/30 dark:text-${mode.id === "peer" ? "purple" : mode.id === "ai" ? "blue" : "emerald"}-400`
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              )}
            >
              {mode.icon}
            </div>
            {mode.name}
            {mode.badge && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[8px] font-bold text-white">
                β
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mode description */}
      <div className="mt-2 rounded-lg bg-gray-50 p-2 text-xs dark:bg-gray-700/30">
        <p className="text-gray-700 dark:text-gray-300">
          {modes.find((mode) => mode.id === selectedMode)?.description}
        </p>
      </div>

      {/* Friend Email Input (conditionally shown) */}
      {selectedMode === "friend" && onFriendEmailChange && (
        <div className="mt-4 animate-fadeIn rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <label
            htmlFor="friend-email"
            className="block text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            Friend's Email
          </label>
          <div className="relative mt-1">
            <Input
              type="email"
              id="friend-email"
              value={friendEmail}
              onChange={(e) => onFriendEmailChange(e.target.value)}
              placeholder="friend@example.com"
              className="pl-9 border-emerald-300 bg-white text-emerald-700 dark:border-emerald-700 dark:bg-gray-800 dark:text-emerald-300"
            />
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
            We'll send them an invitation to join your interview session
          </p>
        </div>
      )}
    </>
  )
} 