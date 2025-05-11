"use client"

import { useState, useRef, useEffect } from "react"
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  isSameDay,
  startOfDay,
  isToday,
  isBefore
} from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { InterviewTypeSelector, INTERVIEW_TYPES } from "@/components/schedule/InterviewTypeSelector"
import { DateSelector } from "@/components/schedule/DateSelector"
import { TimeSlotSelector } from "@/components/schedule/TimeSelector"
import { InterviewModeSelector, DEFAULT_INTERVIEW_MODES } from "@/components/schedule/InterviewModeSelector"
import { InterviewSummary } from "@/components/schedule/InterviewSummary"
import { ScheduleActions } from "@/components/schedule/ScheduleActions"
import { ConfettiAnimation } from "@/components/ui/Confetti"
import { InterviewSchedule } from "@/components/schedule/interview-schedule"
import { ConfirmationModal } from "@/components/schedule/ConfirmationModal"
import { scheduleService } from "@/services/scheduleService"
import { AuthProvider, useAuth } from "@/context/authContext"

// Fixed time slots for every day (or you could get them from your service)
const TIME_SLOTS = ["7:00 AM", "11:00 AM", "3:00 PM", "9:00 PM"]

// Booking constraints
const MAX_BOOKING_DAYS = 14 
const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0) // Set to beginning of today
const MAX_BOOKING_DATE = addDays(TODAY, MAX_BOOKING_DAYS)

function SchedulePageContent() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [currentDate, setCurrentDate] = useState(TODAY)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("technical")
  const [selectedMode, setSelectedMode] = useState<string>("peer")
  const [isScheduling, setIsScheduling] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [showFeedbackOption, setShowFeedbackOption] = useState(false)
  const [wantsFeedback, setWantsFeedback] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [friendEmail, setFriendEmail] = useState("")
  const [scheduleId, setScheduleId] = useState<string>("")

  const scheduleButtonRef = useRef<HTMLButtonElement>(null)

  // Check if we can navigate to previous week (only if it contains today or future dates)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
  const canGoPrevious = isBefore(addDays(startDate, -1), TODAY) ? false : true

  // Check if we can navigate to next week (only if it's within booking window)
  const nextWeekStart = addWeeks(startDate, 1)
  const canGoNext = isBefore(nextWeekStart, addDays(MAX_BOOKING_DATE, 1))

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handlePrevWeek = () => {
    if (canGoPrevious) {
      setCurrentDate(addWeeks(currentDate, -1))
    }
  }

  const handleNextWeek = () => {
    if (canGoNext) {
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

  const handleFriendEmailChange = (email: string) => {
    setFriendEmail(email)
  }

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) return

    if (!isAuthenticated) {
      toast.error("Please sign in to schedule an interview")
      router.push('/auth')
      return
    }

    // For friend mode, validate email
    if (selectedMode === "friend" && !friendEmail) {
      toast.error("Please enter your friend's email address")
      return
    }

    setIsScheduling(true)

    try {
      const scheduledDateTime = new Date(selectedDate)
      
      // Parse time string into hours and minutes
      let hours = 0
      let minutes = 0
      
      if (selectedTime.includes("AM") || selectedTime.includes("PM")) {
        const [timePart, period] = selectedTime.split(" ")
        const [hourStr, minuteStr] = timePart.split(":")
        
        hours = parseInt(hourStr, 10)
        minutes = parseInt(minuteStr, 10)
        
        if (period === "PM" && hours < 12) {
          hours += 12
        } else if (period === "AM" && hours === 12) {
          hours = 0
        }
      } else {
        // Handle 24-hour format if needed
        const [hourStr, minuteStr] = selectedTime.split(":")
        hours = parseInt(hourStr, 10)
        minutes = parseInt(minuteStr, 10)
      }
      
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error("Invalid time format")
      }

      scheduledDateTime.setHours(hours, minutes, 0, 0)
      
      // Create the ISO string
      const scheduledTime = scheduledDateTime.toISOString()
      
      // Map interview mode to backend format
      const interviewModeMap = {
        "peer": "peer-to-peer",
        "ai": "you-vs-ai",
        "friend": "you-vs-friend"
      }
      
      const backendMode = interviewModeMap[selectedMode as keyof typeof interviewModeMap] || "peer-to-peer"
      
      // Call the scheduleService to create a schedule
      const response = await scheduleService.createSchedule(
        scheduledTime, 
        selectedType, 
        backendMode, 
        friendEmail
      )
      
      // Save the scheduleId for later
      setScheduleId(response.scheduleId)
      
      // Show success message
      const selectedTypeName = INTERVIEW_TYPES.find((type) => type.id === selectedType)?.name
      const selectedModeName = DEFAULT_INTERVIEW_MODES.find((mode) => mode.id === selectedMode)?.name
      
      // Show confetti animation
      setShowConfetti(true)
      setIsScheduled(true)

      toast.success("Interview Scheduled!", {
        description: `Your ${selectedTypeName} interview (${selectedModeName}) is scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
        duration: 5000,
      })

      setIsScheduling(false)
      setShowFeedbackOption(true)

      // Show confirmation modal
      setShowConfirmationModal(true)

      // Hide confetti after a few seconds
      setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
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
      setSelectedDate(null)
      setSelectedTime(null)
      setShowFeedbackOption(false)
      setWantsFeedback(false)
      setIsScheduled(false)
      setFriendEmail("")
    }, 500)
  }

  const handleViewSchedule = () => {
    router.push(`/interview/${scheduleId}`)
  }

  const handleCancel = () => {
    setSelectedDate(null)
    setSelectedTime(null)
    setFriendEmail("")
  }

  const handleFeedbackOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWantsFeedback(e.target.checked)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 to-white pt-32 pb-12 dark:from-gray-950 dark:to-gray-900">
      <ConfettiAnimation show={showConfetti} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Schedule Your Interview
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            Choose your interview mode, type, and preferred time
          </p>
        </div>


        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
          {/* Interview Mode & Type Selection */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800 lg:col-span-2">
            <InterviewModeSelector
              selectedMode={selectedMode}
              onSelectMode={handleModeSelect}
              friendEmail={friendEmail}
              onFriendEmailChange={handleFriendEmailChange}
            />

            <InterviewTypeSelector selectedType={selectedType} onTypeSelect={handleTypeSelect} />
          </div>

          {/* Calendar Selection */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800 lg:col-span-3">
            <DateSelector
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              maxBookingDays={MAX_BOOKING_DAYS}
            />

            <TimeSlotSelector
              selectedDate={selectedDate}
              selectedTime={selectedTime || ''}
              onTimeSelect={handleTimeSelect}
            />

            {selectedDate && selectedTime && (
              <InterviewSummary
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedMode={selectedMode}
                selectedType={selectedType}
                friendEmail={friendEmail}
              />
            )}

            <ScheduleActions
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              isScheduling={isScheduling}
              isScheduled={isScheduled}
              selectedMode={selectedMode}
              friendEmail={friendEmail}
              onCancel={handleCancel}
              onSchedule={handleSchedule}
              showFeedbackOption={showFeedbackOption}
              wantsFeedback={wantsFeedback}
              onFeedbackOptionChange={handleFeedbackOptionChange}
            />
          </div>
        </div>

        {/* Interview Schedule Section */}
        <div className="mx-auto mt-16 max-w-5xl">
          <InterviewSchedule />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseConfirmationModal}
        interviewType={INTERVIEW_TYPES.find((type) => type.id === selectedType)?.name || ""}
        date={selectedDate}
        time={selectedTime}
        interviewMode={DEFAULT_INTERVIEW_MODES.find((mode) => mode.id === selectedMode)?.name || ""}
        scheduleId={scheduleId}
        onViewSchedule={handleViewSchedule}
      />
    </div>
  )
}

// Wrap the page content with the AuthProvider
export default function SchedulePage() {
  return (
    <AuthProvider requireAuth={false} redirectToLogin={false}>
      <SchedulePageContent />
    </AuthProvider>
  )
}