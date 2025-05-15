"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Camera, Mic } from "lucide-react"
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
  
  // Matchmaking states
  const [isSearching, setIsSearching] = useState(false)
  const [searchTimeRemaining, setSearchTimeRemaining] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [matchmakingStatusMessage, setMatchmakingStatusMessage] = useState("Searching for a match...")

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
          const checkInterval = joinableData.timeRemaining <= 3 ? 10000 : 30000
          if (intervalId) clearInterval(intervalId)
          intervalId = setInterval(checkJoinable, checkInterval)
        } else {
          setTimeRemaining(null)
          if (joinableData.status === 'searching') {
            // If already searching (e.g., page reloaded), open modal and start search
            setIsModalOpen(true) 
            startSearchingState()
          }
        }
      } catch (error) {
        console.error("Error checking joinable status:", error)
        toast.error("Failed to check interview status")
      }
    }

    checkJoinable()

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (isSearching && socketConnected) {
        socketService.disconnect()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]) // Added eslint-disable for isSearching dependency to avoid re-triggering checkJoinable unnecessarily


  const startSearchingState = () => {
    if (isSearching) return; // Prevent multiple calls

    setIsSearching(true)
    setMatchmakingStatusMessage("Searching for a match...")
    setSearchTimeRemaining(120) // 2 minutes in seconds
    
    const countdownInterval = setInterval(() => {
      setSearchTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(countdownInterval)
          // Backend handles actual timeout, frontend just stops countdown
          return 0 
        }
        return prev - 1
      })
    }, 1000)
    
    connectToSocket()
    
    return () => {
      clearInterval(countdownInterval)
    }
  }

  const connectToSocket = async () => {
    if (socketConnected) return

    try {
      await socketService.connect()
      setSocketConnected(true)
      setMatchmakingStatusMessage("Connected to matchmaking service. Waiting for pair...")
      
      socketService.registerHandlers({
        onMatch: handleMatch,
        onTimeout: handleTimeout,
        onError: handleSocketError
      })
      
      socketService.joinQueue(scheduleId)
    } catch (error) {
      console.error("Socket connection error:", error)
      setMatchmakingStatusMessage("Failed to connect to matchmaking service.")
      toast.error("Failed to connect to matchmaking. Please try again.")
      // Consider closing modal or allowing retry here
      // setIsModalOpen(false); 
      // setIsSearching(false);
    }
  }

  const handleMatch = (data: { sessionId: string; token: string; roomName: string }) => {
    setMatchmakingStatusMessage("Match found! Redirecting to interview room...")
    toast.success("Match found! Redirecting...")
    
    localStorage.setItem(`livekit_creds_${data.roomName}`, JSON.stringify({ token: data.token }))
    
    if (onJoined) {
      onJoined(true)
    }
    
    setIsModalOpen(false) // Close modal before redirect
    setIsSearching(false)
    router.push(`/interview/${data.roomName}`)
    // No need to disconnect socket here as we are navigating away
  }
  
  const handleTimeout = () => {
    setMatchmakingStatusMessage("No match found within the time limit. Please try scheduling another interview.")
    toast.error("No match found. Please try again later.")
    
    if (onJoined) {
      onJoined(false)
    }
    
    // Don\'t close modal immediately, show the message. User can close it.
    // setIsModalOpen(false) 
    setIsSearching(false) 
    setSearchTimeRemaining(null)
    
    if (socketConnected) {
      socketService.disconnect()
      setSocketConnected(false)
    }
  }
  
  const handleSocketError = (error: any) => {
    console.error("Socket error:", error)
    setMatchmakingStatusMessage("A connection error occurred with the matchmaking service.")
    toast.error("Matchmaking connection error. Please try again.")
    // setIsModalOpen(false) // Optionally close modal on error
    setIsSearching(false)
    if (socketConnected) {
      socketService.disconnect()
      setSocketConnected(false)
    }
  }

  const handleJoin = async () => {
    if (!isJoinable || isLoading || isSearching) return

    setIsLoading(true)

    try {
      const result = await scheduleService.joinInterview(scheduleId)
      toast.success(result.message)
      setIsJoinable(false) // Prevent re-joining immediately
      setIsModalOpen(true) // Open the modal
      startSearchingState()  // Start search process
      
    } catch (error: any) {
      toast.error(`Failed to join interview: ${error.message || "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatSearchTime = () => {
    if (searchTimeRemaining === null) return "0:00"
    const minutes = Math.floor(searchTimeRemaining / 60)
    const seconds = searchTimeRemaining % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // If closing modal while still "searching" (e.g. user clicks outside), 
    // it implies cancelling the search.
    if (isSearching) {
      setIsSearching(false)
      setSearchTimeRemaining(null)
      if (socketConnected) {
        socketService.disconnect() // Clean up socket connection
        setSocketConnected(false)
      }
      // Optionally, inform the backend about the cancellation if needed.
      // For now, schedule status might remain "searching" until backend timeout.
      // Or, we might need a cancel API.
      toast.info("Matchmaking cancelled.")
    }
  }

  if (isSearching && !isModalOpen) {
    // This case might occur if a page reloads and state is 'searching' 
    // but modal didn't open from useEffect yet. Or if modal is closed prematurely.
    // It might be better to ensure modal is the single source of truth for searching UI.
    // For now, we'll rely on the modal. If not searching, show regular button.
  }

  if (timeRemaining !== null && timeRemaining > 0 && !isJoinable) {
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
    <>
      <Button
        onClick={handleJoin}
        disabled={!isJoinable || isLoading || isSearching}
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

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl mb-2">
              {searchTimeRemaining === 0 && matchmakingStatusMessage.includes("No match found") 
                ? "Match Not Found" 
                : "Finding Your Interview Partner"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {matchmakingStatusMessage}
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-6 flex flex-col items-center space-y-4">
            {isSearching && searchTimeRemaining !== null && searchTimeRemaining > 0 && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                <p className="text-3xl font-semibold">{formatSearchTime()}</p>
                <p className="text-sm text-gray-500">Time remaining</p>
              </>
            )}
            {(searchTimeRemaining === 0 && !matchmakingStatusMessage.includes("Redirecting")) && (
                <p className="text-red-500 font-medium">
                    Please close this window and try scheduling again later.
                </p>
            )}
             {matchmakingStatusMessage.includes("Redirecting") && (
                <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-md">
              <Camera className="h-5 w-5 text-purple-600" />
              <span>Camera Ready?</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded-md">
              <Mic className="h-5 w-5 text-purple-600" />
              <span>Mic On?</span>
            </div>
          </div>
          
          {/* No explicit close button in DialogFooter, user can click X or outside */}
        </DialogContent>
      </Dialog>
    </>
  )
} 
