"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, ClockIcon, UserIcon, RefreshCw } from "lucide-react"
import { scheduleService } from "@/services/scheduleService"
import { toast } from "sonner"
import { JoinInterviewButton } from "./JoinInterviewButton"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Schedule {
  scheduleId: string
  scheduledTime: string
  interviewType: string
  interviewMode: string
  status?: string
  matched?: boolean
  matchedWith?: {
    userId: string
    name: string
  }
}

export function InterviewSchedule() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await scheduleService.getUserSchedules()
      
      // Sort schedules by date (most recent first)
      const sortedSchedules = [...data].sort((a, b) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      )
      
      setSchedules(sortedSchedules)
    } catch (error: any) {
      console.error("Failed to fetch schedules:", error)
      setError(error.message || "Failed to load your interview schedule")
      toast.error("Failed to load interview schedule", {
        description: error.message || "Please try again later"
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSchedules()
  }

  // Get human-readable mode name
  const getModeName = (mode: string) => {
    switch (mode) {
      case 'peer-to-peer':
        return 'Peer to Peer'
      case 'you-vs-ai':
        return 'AI Interview'
      case 'you-vs-friend':
        return 'Friend Interview'
      default:
        return mode
    }
  }

  // Get human-readable interview type
  const getTypeName = (type: string) => {
    switch (type) {
      case 'technical':
        return 'Technical'
      case 'behavioral':
        return 'Behavioral'
      case 'system-design':
        return 'System Design'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  // Get status badge style
  const getStatusBadge = (status: string) => {
    let bgColor = 'bg-gray-100 text-gray-800'
    let label = status

    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-100 text-yellow-800'
        label = 'Pending'
        break
      case 'searching':
        bgColor = 'bg-blue-100 text-blue-800'
        label = 'Searching'
        break
      case 'matched':
        bgColor = 'bg-green-100 text-green-800'
        label = 'Matched'
        break
      case 'cancelled':
        bgColor = 'bg-red-100 text-red-800'
        label = 'Cancelled'
        break
      case 'completed':
        bgColor = 'bg-purple-100 text-purple-800'
        label = 'Completed'
        break
    }

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor}`}>
        {label}
      </span>
    )
  }

  // Handle when a user joins an interview successfully
  const handleJoined = (scheduleId: string, success: boolean) => {
    if (success) {
      router.push(`/interview/${scheduleId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">Upcoming Interviews</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-2 h-4 w-96 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-6 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="mt-1 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="h-10 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">Upcoming Interviews</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="rounded-full"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        Here are your scheduled interview sessions
      </p>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
          <p className="text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">You don't have any upcoming interviews scheduled.</p>
            <button 
              onClick={() => router.push('/schedule')}
              className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Schedule your first interview
            </button>
          </div>
        ) : (
          schedules.map((schedule) => {
            const scheduledDate = new Date(schedule.scheduledTime)
            const isPastInterview = scheduledDate < new Date()
            
            return (
              <div
                key={schedule.scheduleId}
                className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center
                  ${isPastInterview 
                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50' 
                    : 'border-gray-200 dark:border-gray-700'}`}
              >
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {getTypeName(schedule.interviewType)} Interview
                    </h3>
                    {schedule.status && getStatusBadge(schedule.status)}
                    {isPastInterview && !schedule.status && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Past
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{getModeName(schedule.interviewMode)}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(scheduledDate, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <ClockIcon className="h-4 w-4" />
                    <span>{format(scheduledDate, "h:mm a")}</span>
                  </div>
                  {schedule.matched && schedule.matchedWith && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <UserIcon className="h-4 w-4" />
                      <span>{schedule.matchedWith.name}</span>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-auto">
                  {!isPastInterview && schedule.status === 'pending' && schedule.interviewMode === 'peer-to-peer' ? (
                    <JoinInterviewButton 
                      scheduleId={schedule.scheduleId} 
                      onJoined={(success) => handleJoined(schedule.scheduleId, success)}
                    />
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/interview/${schedule.scheduleId}`)}
                      className="w-full"
                    >
                      {isPastInterview ? "View Summary" : "View Details"}
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
} 