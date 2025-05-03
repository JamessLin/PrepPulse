"use client"

import { Code, Users, Briefcase, Cpu } from "lucide-react"
import { CalendarIcon, CheckIcon } from "@/components/ui/icons"
import { InterviewTypeSelectorProps } from "@/lib/types"

/**
 * Maps string icon names to Lucide icon components
 */
const IconMap = {
  Code,
  Users,
  Briefcase,
  Cpu
}

/**
 * Component for selecting an interview type
 */
export function InterviewTypeSelector({
  interviewTypes,
  selectedType,
  onSelectType
}: InterviewTypeSelectorProps) {
  return (
    <>
      {/* Heading */}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-gray-900 dark:text-white">
          <CalendarIcon className="h-5 w-5 text-purple-600" />
          Interview Type
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Select what type of interview you want to practice
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {interviewTypes.map((type) => {
          const Icon = IconMap[type.iconName]

          return (
            <div
              key={type.id}
              className={`group overflow-hidden rounded-2xl transition-all ${
                selectedType === type.id
                  ? "bg-gradient-to-r from-purple-50 to-indigo-50 shadow-[0_4px_12px_rgba(107,70,193,0.15)] dark:from-purple-900/30 dark:to-indigo-900/30"
                  : "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/80"
              }`}
              onClick={() => onSelectType(type.id)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        selectedType === type.id
                          ? "bg-purple-600 text-white"
                          : "bg-purple-100 text-purple-600 dark:bg-gray-800 dark:text-purple-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-serif font-normal text-gray-900 dark:text-white">
                      {type.name}
                    </h3>
                  </div>
                  {selectedType === type.id && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                      <CheckIcon className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <p className="mt-2 pl-10 text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
