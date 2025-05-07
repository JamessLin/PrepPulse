"use client"

import { useState, useRef, useEffect } from "react"
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  isSameDay,
  startOfDay,
  isToday
} from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { InterviewTypeSelector } from "@/components/schedule/InterviewTypeSelector"
import { DateSelector } from "@/components/schedule/DateSelector" 
import { TimeSelector } from "@/components/schedule/TimeSelector"
import { InterviewModeSelector, InterviewMode } from "@/components/schedule/InterviewModeSelector"
import { Confetti } from "@/components/ui/Confetti"
import { Button } from "@/components/ui/button"
import { InterviewType } from "@/lib/types"
import { Check, CheckIcon, X, Users, Bot, UserPlus } from "lucide-react"
import { ConfirmationModal } from "@/components/schedule/ConfirmationModal"
import { scheduleService } from "@/services/scheduleService"
import { authService } from "@/services/authService"

export const INTERVIEW_TYPES: InterviewType[] = [
  {
    id: "technical",
    name: "Technical",
    description: "Coding, system design, and technical concepts",
    iconName: "Code"
  },
  {
    id: "behavioral",
    name: "Behavioral",
    description: "Soft skills, teamwork, and past experiences",
    iconName: "Users"
  },
  {
    id: "case",
    name: "Case Interview",
    description: "Problem-solving and analytical thinking",
    iconName: "Briefcase"
  },
  {
    id: "system",
    name: "System Design",
    description: "Architecture and large-scale system design",
    iconName: "Cpu"
  }
]

// Interview modes
const INTERVIEW_MODES: InterviewMode[] = [
  {
    id: "peer",
    name: "Peer to Peer",
    description: "Practice with another person seeking interview practice",
    icon: <Users className="h-5 w-5" />,
    color: "from-purple-600 to-indigo-600",
    lightColor: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    darkColor: "bg-purple-600 text-white",
  },
  {
    id: "ai",
    name: "You vs AI",
    description: "Practice with our advanced AI interviewer",
    icon: <Bot className="h-5 w-5" />,
    color: "from-blue-600 to-cyan-600",
    lightColor: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    darkColor: "bg-blue-600 text-white",
    badge: "Beta",
  },
  {
    id: "friend",
    name: "You vs Friend",
    description: "Invite a specific person to interview you",
    icon: <UserPlus className="h-5 w-5" />,
    color: "from-emerald-600 to-teal-600",
    lightColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    darkColor: "bg-emerald-600 text-white",
  },
]

export default function SchedulePage() {
  const router = useRouter()
  const today = new Date()

  const [currentDate, setCurrentDate] = useState<Date>(today)
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("technical")
  const [selectedMode, setSelectedMode] = useState<string>("peer")
  const [friendEmail, setFriendEmail] = useState<string>("")
  const [isScheduling, setIsScheduling] = useState<boolean>(false)
  const [isScheduled, setIsScheduled] = useState<boolean>(false)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(true)
  const [scheduleId, setScheduleId] = useState<string>("")
  const scheduleButtonRef = useRef<HTMLButtonElement>(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const maxBookingDate = addDays(today, 14)

  // Check if user is authenticated
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      router.push('/auth?redirect=/schedule');
    }
  }, [router]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime("")
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handlePrevWeek = () => {
    const prevWeekStart = startOfWeek(addWeeks(currentDate, -1), { weekStartsOn: 1 })
    if (prevWeekStart >= startOfWeek(today, { weekStartsOn: 1 })) {
      setCurrentDate(addWeeks(currentDate, -1))
    }
  }

  const handleNextWeek = () => {
    const nextWeekStart = startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 })
    if (nextWeekStart <= maxBookingDate) {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
  }

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId)
    if (modeId !== "friend") {
      setFriendEmail("")
    }
  }

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) return
  
    setIsScheduling(true)
  
    try {
      const scheduledDateTime = new Date(selectedDate)
      
      const [hours, minutes] = selectedTime.split(':').map(num => parseInt(num, 10))
      
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error("Invalid time format")
      }

      scheduledDateTime.setHours(hours, minutes, 0, 0)
      
      console.log("Scheduled date time:", scheduledDateTime)
      
      // Create the ISO string
      const scheduledTime = scheduledDateTime.toISOString()
      
      console.log("Scheduled time ISO:", scheduledTime)
      
      // Call the scheduleService to create a schedule
      const response = await scheduleService.createSchedule(scheduledTime, selectedType)
      //const response = await scheduleService.createSchedule(scheduledTime, selectedType, selectedMode, friendEmail)
      
      // Save the scheduleId for later
      setScheduleId(response.scheduleId)
      
      // Save to localStorage for demo purposes
      const storedSchedules = localStorage.getItem('userSchedules') 
      const schedules = storedSchedules ? JSON.parse(storedSchedules) : []
      schedules.push({
        scheduleId: response.scheduleId,
        scheduledTime,
        interviewType: selectedType,
        // interviewMode: selectedMode,
        // friendEmail: friendEmail || undefined,
        matched: false
      })
      localStorage.setItem('userSchedules', JSON.stringify(schedules))
      
      // Show success message
      const selectedTypeName = INTERVIEW_TYPES.find((type) => type.id === selectedType)?.name
      const selectedModeName = INTERVIEW_MODES.find((mode) => mode.id === selectedMode)?.name
      
      setIsScheduled(true)
      setShowConfetti(true)
  
      toast.success("Interview Scheduled!", {
        description: `Your ${selectedTypeName} interview (${selectedModeName}) is scheduled for ${format(
          selectedDate,
          "MMMM d, yyyy"
        )} at ${selectedTime}.`,
        duration: 5000
      })
  
      setShowConfirmationModal(true)
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error: any) {
      console.error("Scheduling error:", error)
      toast.error("Failed to schedule interview", {
        description: error.message || "Please try again later",
        duration: 5000
      })
    } finally {
      setIsScheduling(false)
    }
  }

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false)

    // Reset selections after closing the modal
    setTimeout(() => {
      setSelectedDate(today)
      setSelectedTime('')
      setIsScheduled(false)
    }, 500)
  }

  const handleViewSchedule = () => {
    router.push(`/interview/${scheduleId}`)
  }

  const handleCancel = () => {
    setSelectedDate(today)
    setSelectedTime("")
  }

  const canGoPrevious =
    startOfWeek(currentDate, { weekStartsOn: 1 }) >
    startOfWeek(today, { weekStartsOn: 1 })
  const canGoNext =
    startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 }) <= maxBookingDate

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 to-white pt-32 pb-12 dark:from-gray-950 dark:to-gray-900">
      {showConfetti && <Confetti />}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Schedule Your Mock Interview
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            Select a date, time, and interview type to get matched with a peer
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800 lg:col-span-1">
            <div className="mb-8">
              <InterviewModeSelector
                modes={INTERVIEW_MODES}
                selectedMode={selectedMode}
                onSelectMode={handleModeSelect}
                friendEmail={friendEmail}
                onFriendEmailChange={setFriendEmail}
              />
            </div>
            
            <InterviewTypeSelector
              interviewTypes={INTERVIEW_TYPES}
              selectedType={selectedType}
              onSelectType={handleTypeSelect}
            />
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800 lg:col-span-2">
            <DateSelector
              currentDate={currentDate}
              selectedDate={selectedDate}
              today={today}
              maxBookingDate={maxBookingDate}
              onDateSelect={handleDateSelect}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
            />

            {selectedDate && (
              <TimeSelector
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onTimeSelect={handleTimeSelect}
              />
            )}

            <div className="mt-8 flex flex-col border-t pt-6">
              <div className="flex justify-end gap-4">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="rounded-full border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <X className="mr-2 inline-block h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime || isScheduling || isScheduled}
                  className={`relative rounded-full px-8 py-2.5 font-medium transition-all ${
                    selectedDate && selectedTime && !isScheduling && !isScheduled
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
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseConfirmationModal}
        interviewType={INTERVIEW_TYPES.find((type) => type.id === selectedType)?.name || ""}
        date={selectedDate}
        time={selectedTime}
        scheduleId={scheduleId}
        onViewSchedule={handleViewSchedule}
        interviewMode={INTERVIEW_MODES.find((mode) => mode.id === selectedMode)?.name || "Peer to Peer"}
      />
    </div>
  )
}