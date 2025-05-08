"use client"

import { Code, Users, Briefcase, Cpu } from "lucide-react"
import { CalendarIcon, CheckIcon } from "@/components/ui/icons"

// Interview types with icons
export const INTERVIEW_TYPES = [
  {
    id: "technical",
    name: "Technical",
    description: "Practice coding challenges, algorithms, and technical concepts",
    icon: <Code className="h-5 w-5" />,
  },
  {
    id: "behavioral",
    name: "Behavioral",
    description: "Master questions about teamwork, leadership, and past experiences",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "case",
    name: "Case Interview",
    description: "Tackle business problems and demonstrate analytical thinking",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    id: "system",
    name: "System Design",
    description: "Design scalable architectures and discuss trade-offs",
    icon: <Cpu className="h-5 w-5" />,
  },
]

interface InterviewTypeSelectorProps {
  selectedType: string
  onTypeSelect: (typeId: string) => void
}

export function InterviewTypeSelector({ selectedType, onTypeSelect }: InterviewTypeSelectorProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 font-serif text-lg font-normal text-gray-900 dark:text-white">
          <CalendarIcon className="h-5 w-5 text-purple-600" />
          Interview Type
        </h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Select what type of interview you want to practice
        </p>
      </div>

      <div className="space-y-2">
        {INTERVIEW_TYPES.map((type) => (
          <div
            key={type.id}
            className={`group cursor-pointer overflow-hidden rounded-xl transition-all hover:translate-y-[-2px] ${
              selectedType === type.id
                ? "bg-gradient-to-r from-purple-50 to-indigo-50 shadow-[0_4px_12px_rgba(107,70,193,0.15)] dark:from-purple-900/30 dark:to-indigo-900/30"
                : "bg-white hover:bg-gray-50 hover:shadow-md dark:bg-gray-900 dark:hover:bg-gray-800/80"
            }`}
            onClick={() => onTypeSelect(type.id)}
          >
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                      selectedType === type.id
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        : "bg-purple-100 text-purple-600 dark:bg-gray-800 dark:text-purple-400"
                    }`}
                  >
                    {type.icon}
                  </div>
                  <h3 className="font-serif text-base font-normal text-gray-900 dark:text-white">{type.name}</h3>
                </div>
                {selectedType === type.id ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                    <CheckIcon className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700"></div>
                )}
              </div>
              <p className="mt-1 pl-12 text-xs text-gray-600 dark:text-gray-400">{type.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
