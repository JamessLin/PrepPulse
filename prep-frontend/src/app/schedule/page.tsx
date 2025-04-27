"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { CalendarIcon, ClockIcon, CheckIcon } from "@/components/ui/icons"

// Fixed time slots for every day
const TIME_SLOTS = ["7:00 AM", "11:00 AM", "3:00 PM", "9:00 PM"]

// Interview types
const INTERVIEW_TYPES = [
  { id: "technical", name: "Technical", description: "Coding, system design, and technical concepts" },
  { id: "behavioral", name: "Behavioral", description: "Soft skills, teamwork, and past experiences" },
  { id: "case", name: "Case Interview", description: "Problem-solving and analytical thinking" },
  { id: "system", name: "System Design", description: "Architecture and large-scale system design" },
]

// Mock available slots (in a real app, this would come from an API)
const getRandomAvailability = () => {
  return TIME_SLOTS.filter(() => Math.random() > 0.3)
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("technical")

  // Generate dates for the week view
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  // Mock available time slots for the selected date
  const availableSlots = selectedDate ? getRandomAvailability() : []

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handlePrevWeek = () => {
    setCurrentDate(addWeeks(currentDate, -1))
  }

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1))
  }

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
  }

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) return

    const selectedTypeName = INTERVIEW_TYPES.find((type) => type.id === selectedType)?.name

    toast.success("Interview Scheduled!", {
      description: `Your ${selectedTypeName} interview is scheduled for ${format(selectedDate, "MMMM d, yyyy")} at ${selectedTime}.`,
      duration: 5000,
    })

    // Reset selections
    setSelectedDate(null)
    setSelectedTime(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-12 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Schedule Your Mock Interview
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
            Select a date, time, and interview type to get matched with a peer
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
          {/* Interview Type Selection */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-gray-800 lg:col-span-1">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-gray-900 dark:text-white">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                Interview Type
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Select what type of interview you want to practice
              </p>
            </div>

            <div className="space-y-3">
              {INTERVIEW_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`group cursor-pointer overflow-hidden rounded-2xl transition-all ${
                    selectedType === type.id
                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 shadow-[0_2px_8px_rgba(107,70,193,0.12)] dark:from-purple-900/30 dark:to-indigo-900/30"
                      : "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/80"
                  }`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-normal text-gray-900 dark:text-white">{type.name}</h3>
                      {selectedType === type.id && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                          <CheckIcon className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Selection */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-gray-800 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 font-serif text-xl font-normal text-gray-900 dark:text-white">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                  Select Date & Time
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Week of {format(startDate, "MMMM d, yyyy")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevWeek}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextWeek}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date) => (
                <button
                  key={date.toString()}
                  onClick={() => handleDateSelect(date)}
                  className={`flex flex-col items-center justify-center rounded-2xl py-3 transition-all ${
                    isSameDay(date, selectedDate || new Date(-1))
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="text-xs font-normal">{format(date, "EEE")}</span>
                  <span className="font-serif text-lg font-normal">{format(date, "d")}</span>
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="mt-8">
                <h3 className="mb-4 font-serif font-normal text-gray-900 dark:text-white">
                  Available times for {format(selectedDate, "MMMM d, yyyy")}:
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`flex items-center justify-center gap-2 rounded-2xl py-3 transition-all ${
                          selectedTime === time
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      >
                        <ClockIcon className="h-4 w-4" />
                        {time}
                      </button>
                    ))
                  ) : (
                    <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">
                      No available slots for this date. Please select another date.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between border-t pt-6">
              <button className="rounded-full border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedTime}
                className={`rounded-full px-6 py-2 font-medium transition-all ${
                  selectedDate && selectedTime
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_2px_8px_rgba(107,70,193,0.24)] hover:shadow-[0_4px_12px_rgba(107,70,193,0.32)]"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                <CheckIcon className="mr-2 inline-block h-4 w-4" />
                Schedule Interview
              </button>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mx-auto mt-16 max-w-3xl rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-gray-800">
          <h2 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">How Matching Works</h2>
          <div className="mt-8 space-y-8">
            <div className="flex gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-100/50 blur-lg dark:bg-purple-900/20"></div>
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                  <span className="font-serif text-lg font-light text-purple-600 dark:text-purple-400">1</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-normal text-gray-900 dark:text-white">Select Your Availability</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Choose from our fixed daily time slots (7AM, 11AM, 3PM, 9PM) that work with your schedule
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-100/50 blur-lg dark:bg-purple-900/20"></div>
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                  <span className="font-serif text-lg font-light text-purple-600 dark:text-purple-400">2</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-normal text-gray-900 dark:text-white">Get Matched</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  We'll match you with another peer who's available at the same time
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-100/50 blur-lg dark:bg-purple-900/20"></div>
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                  <span className="font-serif text-lg font-light text-purple-600 dark:text-purple-400">3</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-normal text-gray-900 dark:text-white">Receive Confirmation</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Once matched, you'll receive an email with a link to your interview room
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-100/50 blur-lg dark:bg-purple-900/20"></div>
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                  <span className="font-serif text-lg font-light text-purple-600 dark:text-purple-400">4</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-normal text-gray-900 dark:text-white">Conduct the Interview</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Take turns interviewing each other and provide constructive feedback
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
