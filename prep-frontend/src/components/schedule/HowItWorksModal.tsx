"use client"

import { X } from "lucide-react"
import { HowItWorksModalProps } from "@/lib/types"

/**
 * Modal explaining the step-by-step interview matching process
 */
export function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  const steps = [
    {
      number: 1,
      title: "Select Your Availability",
      description:
        "Choose from our fixed daily time slots (7AM, 11AM, 3PM, 9PM) that work with your schedule",
    },
    {
      number: 2,
      title: "Get Matched",
      description:
        "We'll match you with another peer who's available at the same time",
    },
    {
      number: 3,
      title: "Receive Confirmation",
      description:
        "Once matched, you'll receive an email with a link to your interview room",
    },
    {
      number: 4,
      title: "Conduct the Interview",
      description:
        "Take turns interviewing each other and provide constructive feedback",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="relative mx-auto w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl transition-all dark:bg-gray-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Heading */}
        <h2 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">
          How Matching Works
        </h2>

        {/* Steps */}
        <div className="mt-8 space-y-8">
          {steps.map(({ number, title, description }) => (
            <div key={number} className="flex gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-100/50 blur-lg dark:bg-purple-900/20" />
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                  <span className="font-serif text-lg font-light text-purple-600 dark:text-purple-400">
                    {number}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-normal text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-2.5 font-medium text-white shadow-[0_4px_14px_rgba(107,70,193,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(107,70,193,0.4)]"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
