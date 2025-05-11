"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { scheduleService } from "@/services/scheduleService"
import { socketService } from "@/services/socketService"
import { useRouter } from "next/navigation"

interface JoinInterviewButtonProps {
  scheduleId: string
  onJoined?: (success: boolean) => void
}

export function JoinInterviewButton({ scheduleId, onJoined }: JoinInterviewButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isJoinable, setIsJoinable] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [reason, setReason] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchTimeRemaining, setSearchTimeRemaining] = useState<number | null>(null)
  const [socketConnected, setSocketConnected] = useState(false)

  // Check if the interview is joinable
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    const checkJoinable = async () => {
      try {
        const joinableData = await scheduleService.checkScheduleJoinable(scheduleId)
        
        setIsJoinable(joinableData.joinable)
        setReason(joinableData.reason)
        
        if (!joinableData.joinable && joinableData.timeRemaining > 0) {
          setTimeRemaining(joinableData.timeRemaining)
          
          // If time remaining is under 3 minutes, check more frequently
          const checkInterval = joinableData.timeRemaining <= 3 ? 10000 : 30000
          
          // Clear any existing interval
          if (intervalId) clearInterval(intervalId)
          
          // Set up recurring check
          intervalId = setInterval(checkJoinable, checkInterval)
        } else {
          setTimeRemaining(null)
          
          // If status is already 'searching', set the searching state
          if (joinableData.status === 'searching') {
            startSearchingState()
          }
        }
      } catch (error) {
        console.error("Error checking joinable status:", error)
        toast.error("Failed to check interview status")
      }
    }

    checkJoinable()

    // Clean up on unmount
    return () => {
      if (intervalId) clearInterval(intervalId)
      // Disconnect socket if component unmounts while searching
      if (isSearching && socketConnected) {
        socketService.disconnect()
      }
    }
  }, [scheduleId])

  // Setup timer for searching state
  const startSearchingState = () => {
    setIsSearching(true)
    setSearchTimeRemaining(120) // 2 minutes in seconds
    
    // Start the countdown timer
    const countdownInterval = setInterval(() => {
      setSearchTimeRemaining((prev) => {
        // If timer reaches 0, stop the timer but don't change searching state
        // (the socket will handle timeout event)
        if (prev === null || prev <= 0) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    // Connect to socket server for real-time updates
    connectToSocket()
    
    return () => {
      clearInterval(countdownInterval)
    }
  }

  // Connect to the socket server
  const connectToSocket = async () => {
    if (socketConnected) return

    try {
      // Connect to socket
      await socketService.connect()
      setSocketConnected(true)
      
      // Register event handlers
      socketService.registerHandlers({
        onMatch: handleMatch,
        onTimeout: handleTimeout,
        onError: handleSocketError
      })
      
      // Join the matchmaking queue
      socketService.joinQueue(scheduleId)
    } catch (error) {
      console.error("Socket connection error:", error)
      toast.error("Failed to connect to matchmaking service")
    }
  }

  // Socket event handlers
  const handleMatch = (data: { sessionId: string; token: string; roomName: string }) => {
    // Stop searching state
    setIsSearching(false)
    toast.success("Match found! Redirecting to interview room...")
    
    // Store match data in localStorage or state management
    localStorage.setItem(`interview_session_${scheduleId}`, JSON.stringify(data))
    
    // Notify parent component
    if (onJoined) {
      onJoined(true)
    }
    
    // Redirect to interview room
    router.push(`/interview/${scheduleId}`)
  }
  
  const handleTimeout = () => {
    setIsSearching(false)
    setSearchTimeRemaining(null)
    toast.error("No match found within time limit. Please try again later.")
    
    // Notify parent component
    if (onJoined) {
      onJoined(false)
    }
    
    // Disconnect socket
    socketService.disconnect()
    setSocketConnected(false)
  }
  
  const handleSocketError = (error: any) => {
    console.error("Socket error:", error)
    toast.error("Connection error. Please try again.")
    setIsSearching(false)
    setSocketConnected(false)
  }

  // Handle join button click
  const handleJoin = async () => {
    if (!isJoinable || isLoading || isSearching) return

    setIsLoading(true)

    try {
      // Call API to join interview
      const result = await scheduleService.joinInterview(scheduleId)
      
      toast.success(result.message)
      setIsJoinable(false)
      setIsLoading(false)
      
      // Start searching state
      startSearchingState()
      
    } catch (error: any) {
      setIsLoading(false)
      toast.error(`Failed to join interview: ${error.message}`)
    }
  }

  // Format the search time remaining
  const formatSearchTime = () => {
    if (searchTimeRemaining === null) return ""
    
    const minutes = Math.floor(searchTimeRemaining / 60)
    const seconds = searchTimeRemaining % 60
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (isSearching) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          <span className="text-sm font-medium">Searching for a match...</span>
        </div>
        <p className="text-xs text-gray-500">
          Time remaining: {formatSearchTime()}
        </p>
        {!socketConnected && (
          <p className="text-xs text-red-500">
            Connecting to matchmaking service...
          </p>
        )}
      </div>
    )
  }

  if (timeRemaining !== null && timeRemaining > 0) {
    return (
      <Button 
        variant="outline" 
        className="w-full" 
        disabled
      >
        Available in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}
      </Button>
    )
  }
  
  return (
    <Button
      onClick={handleJoin}
      disabled={!isJoinable || isLoading}
      className={`w-full ${!isJoinable ? 'bg-gray-200 text-gray-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining...
        </>
      ) : isJoinable ? (
        "Join Interview"
      ) : (
        reason || "Not available"
      )}
    </Button>
  )
} 