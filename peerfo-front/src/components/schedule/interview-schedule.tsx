"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { CalendarIcon, ClockIcon, UserIcon, Users, Computer, Mail } from "lucide-react"
import { scheduleService } from "@/services/scheduleService"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { JoinInterviewButton } from "./JoinInterviewButton"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import React from "react"

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
  } | null
  friend_email?: string | null
  friend_status?: string | null
}

// Helper function to map status codes to human-readable text
const getStatusText = (status?: string): string => {
  switch (status) {
    case 'pending': return 'Pending Confirmation';
    case 'searching': return 'Searching for Match';
    case 'matched': return 'Match Found';
    case 'cancelled': return 'Cancelled';
    case 'completed': return 'Completed';
    case 'active': return 'In Progress'; // Assuming 'active' might be a status
    default: return status || 'Unknown Status';
  }
};

// Helper function to map mode codes to icons and text
const getModeDetails = (mode: string): { icon: React.ElementType; name: string } => {
  switch (mode) {
    case 'peer-to-peer': return { icon: Users, name: 'Peer to Peer' };
    case 'you-vs-ai': return { icon: Computer, name: 'AI Interview' };
    case 'you-vs-friend': return { icon: Mail, name: 'Friend Interview' };
    default: return { icon: UserIcon, name: mode }; // Fallback icon
  }
};

export function InterviewSchedule() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // State for the details modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedScheduleDetails, setSelectedScheduleDetails] = useState<Schedule | null>(null)

  const fetchSchedules = async () => {
    // Only proceed if authenticated
    if (isAuthenticated !== true) {
      console.log('fetchSchedules skipped: not authenticated');
      setIsLoading(false); // Ensure loading is false if not authenticated
      setSchedules([]); // Clear schedules if user logs out
      return; 
    }

    console.log('Fetching schedules...');
    setIsLoading(true) // Set loading true at the start of every fetch
    setError(null)

    try {
      // We no longer need forceRefresh parameter here as we fetch on specific triggers
      const response = await scheduleService.getUserSchedules() 
      console.log('InterviewSchedule: API response received:', response);
      
      let rawSchedules: Schedule[] = [];
      // Adapt based on actual consistent API response structure
      if (response && Array.isArray(response.schedules)) {
        rawSchedules = response.schedules;
      } else if (Array.isArray(response)) { // Keep fallback if API sometimes returns array directly
        rawSchedules = response;
      } else {
        console.warn('InterviewSchedule: Response was not in expected format:', response);
      }
      
      const sortedSchedules = [...rawSchedules].sort((a, b) => 
        new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
      )
      
      setSchedules(sortedSchedules)
    } catch (error: any) { // Catch block remains largely the same
      console.error("InterviewSchedule: Failed to fetch schedules:", error)
      setError(error.message || "Failed to load your interview schedule")
      setSchedules([])
      
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        toast.error("Authentication error", {
          description: "Please sign in again to view your schedules"
        })
        setIsAuthenticated(false); // Explicitly set auth to false on auth error
      } else {
        toast.error("Failed to load interview schedule", {
          description: error.message || "Please try again later"
        })
      }
    } finally {
      setIsLoading(false) // Set loading false at the end
    }
  }

  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const initialAuth = !!session;
      console.log('Initial auth state:', initialAuth);
      setIsAuthenticated(initialAuth);
      if (initialAuth) {
          fetchSchedules(); // Trigger fetch immediately if already authenticated
      }
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentAuth = !!session;
        console.log('Auth state changed:', currentAuth, 'Event:', _event);
        setIsAuthenticated(currentAuth);
        // Trigger fetch ONLY when state changes TO authenticated
        if (currentAuth && isAuthenticated === false) { 
          fetchSchedules(); 
        }
        // If state changes to logged out, clear schedules
        if (!currentAuth) {
            setSchedules([]);
            setError(null); // Clear errors on logout
        }
      }
    )
    
    // Cleanup listener
    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthenticated]); // Rerun when isAuthenticated changes (to handle the login transition)

  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refetching schedules...');
      // Only fetch if authenticated and not already loading
      if (isAuthenticated === true && !isLoading) {
         fetchSchedules();
      }
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, isLoading]); // Add dependencies

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
  const getStatusBadge = (status?: string) => {
    if (!status) return null; // Handle undefined status

    let bgColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    let label = getStatusText(status) // Use helper function

    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        break
      case 'searching':
        bgColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        break
      case 'matched':
      case 'active': // Group similar active states
        bgColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        break
      case 'cancelled':
        bgColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        break
      case 'completed':
        bgColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        break
    }

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor}`}>
        {label}
      </span>
    )
  }

  // --- NEW: Function to open the details modal ---
  const handleViewDetailsClick = (schedule: Schedule) => {
    console.log("Opening details for:", schedule);
    setSelectedScheduleDetails(schedule);
    setIsDetailsModalOpen(true);
  }

  if (isAuthenticated === null) { // Initial state before auth check completes
     return (
       <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800">
         <div className="animate-pulse">
           <div className="h-8 w-64 mb-6 rounded bg-gray-200 dark:bg-gray-700"></div>
           <div className="space-y-4">
             {[1, 2].map((i) => (
               <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
             ))}
           </div>
         </div>
       </div>
     )
  }

  if (isLoading && schedules.length === 0) {
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
    <> {/* Wrap in Fragment to allow Dialog sibling */}
      <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all dark:bg-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">Upcoming Interviews</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          Here are your scheduled interview sessions
        </p>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
            <p className="text-sm font-medium">Error loading schedules:</p>
            <p className="text-sm">{error}</p>
            <Button 
              variant="link"
              size="sm" 
              onClick={fetchSchedules} // Allow manual retry on error
              disabled={isLoading} // Disable if already loading
              className="mt-1 p-0 h-auto text-red-800 dark:text-red-300 hover:underline"
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {isAuthenticated && !isLoading && schedules.length === 0 && !error && (
             <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">You don\'t have any upcoming interviews scheduled.</p>
              <button 
                onClick={() => router.push('/schedule')}
                className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Schedule your first interview
              </button>
            </div>
          )}
          
          {!isAuthenticated && !isLoading && (
             <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">Please sign in to view your scheduled interviews.</p>
            </div>
          )}
          
          {isAuthenticated && schedules.length > 0 && (
            schedules.map((schedule) => {
              const scheduledDate = new Date(schedule.scheduledTime)
              const isPastInterview = scheduledDate < new Date()
              const modeDetails = getModeDetails(schedule.interviewMode); // Get mode details

              return (
                <div
                  key={schedule.scheduleId}
                  className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center
                    ${isPastInterview
                      ? 'border-gray-200 bg-gray-50 opacity-70 dark:border-gray-700 dark:bg-gray-800/50' // Added opacity for past
                      : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {getTypeName(schedule.interviewType)} Interview
                      </h3>
                      {getStatusBadge(schedule.status)}
                      {isPastInterview && !schedule.status && ( // Fallback "Past" badge if status missing
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Past
                        </span>
                      )}
                    </div>
                    {/* Use Mode Icon and Name */}
                    <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                       <modeDetails.icon className="h-4 w-4" />
                       {modeDetails.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm"> {/* Adjusted gap */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(scheduledDate, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4" />
                      <span>{format(scheduledDate, "h:mm a")}</span>
                    </div>
                    {/* Display matched user if available */}
                    {schedule.matchedWith && schedule.matchedWith.name && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <UserIcon className="h-4 w-4" />
                        <span>Matched: {schedule.matchedWith.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:w-auto">
                    {/* Conditional rendering for Join/View button */}
                    {!isPastInterview && schedule.status === 'pending' && schedule.interviewMode === 'peer-to-peer' ? (
                      <JoinInterviewButton
                        scheduleId={schedule.scheduleId}
                        // onJoined prop might not be needed if Join button handles redirect internally
                        // onJoined={(success) => handleJoined(schedule.scheduleId, success)}
                      />
                    ) : (
                      <Button
                        variant="outline"
                        // --- UPDATED onClick ---
                        onClick={() => handleViewDetailsClick(schedule)}
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

      {/* --- NEW: Details Modal --- */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              Summary of your scheduled interview session.
            </DialogDescription>
          </DialogHeader>
          {selectedScheduleDetails && (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="font-medium text-gray-900 dark:text-white">{getTypeName(selectedScheduleDetails.interviewType)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Mode:</span>
                 <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                   {/* Correctly get icon from getModeDetails */}
                   {React.createElement(getModeDetails(selectedScheduleDetails.interviewMode).icon, { className: "h-4 w-4" })}
                   {getModeDetails(selectedScheduleDetails.interviewMode).name}
                 </span>
              </div>
               <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">{format(new Date(selectedScheduleDetails.scheduledTime), "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">{format(new Date(selectedScheduleDetails.scheduledTime), "h:mm a")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                {getStatusBadge(selectedScheduleDetails.status)}
              </div>
              {/* Display matched user if available */}
              {selectedScheduleDetails.matchedWith && selectedScheduleDetails.matchedWith.name && (
                 <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Matched With:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedScheduleDetails.matchedWith.name}</span>
                 </div>
              )}
               {/* Display friend email if available */}
              {selectedScheduleDetails.interviewMode === 'you-vs-friend' && selectedScheduleDetails.friend_email && (
                 <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Friend Email:</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{selectedScheduleDetails.friend_email}</span> {/* Added truncate */}
                 </div>
              )}
            </div>
          )}
          <div className="mt-6 flex justify-end">
             <Button variant="ghost" onClick={() => setIsDetailsModalOpen(false)}>Close</Button> {/* Changed to ghost */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 