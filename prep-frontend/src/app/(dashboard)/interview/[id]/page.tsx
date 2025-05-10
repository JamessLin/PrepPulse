'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { scheduleService } from '@/services/scheduleService';
import { socketService } from '@/services/socketService';
import { livekitService } from '@/services/livekitService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function InterviewPage() {
  const [status, setStatus] = useState<'loading' | 'waiting' | 'matched' | 'no-match' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(120); // 2 minutes countdown
  const router = useRouter();
  const params = useParams();
  const scheduleId = params?.id as string;

  useEffect(() => {
    if (!scheduleId) {
      setError('Invalid schedule ID');
      setStatus('error');
      return;
    }

    let countdownInterval: NodeJS.Timeout;
    let matchData: any = null;

    // Check if we already have match data from localStorage
    const storedMatchData = localStorage.getItem(`interview_session_${scheduleId}`);
    if (storedMatchData) {
      try {
        matchData = JSON.parse(storedMatchData);
        if (matchData.sessionId && matchData.token && matchData.roomName) {
          setStatus('matched');
          router.push(`/interview-room/${matchData.sessionId}?token=${encodeURIComponent(matchData.token)}&room=${encodeURIComponent(matchData.roomName)}`);
          return;
        }
      } catch (e) {
        console.error('Failed to parse stored match data', e);
        // Continue with socket connection if parsing fails
      }
    }

    // Set up socket connection and handlers
    const setupSocket = async () => {
      try {
        // First check if the schedule is in 'searching' state
        const scheduleDetails = await scheduleService.getSchedule(scheduleId);
        
        if (scheduleDetails.status === 'matched') {
          // Already matched, generate LiveKit token and redirect to room
          if (scheduleDetails.matchedWith) {
            try {
              // Get current user info
              const currentUser = authService.getCurrentUser();
              const displayName = currentUser ? 
                `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'User' 
                : 'User';
              //TODO: Name From PROFILE SERVICE AND NOT AUTH
              // Create LiveKit room name using the schedule ID
              const livekitRoomName = `interview-${scheduleId}`;
              
              // Get LiveKit token
              const livekitToken = await livekitService.getToken(livekitRoomName, displayName);
              
              // Create match data
              const matchData = {
                sessionId: scheduleId,
                token: livekitToken,
                roomName: livekitRoomName
              };
              
              // Store match data for future reference
              localStorage.setItem(`interview_session_${scheduleId}`, JSON.stringify(matchData));
              
              setStatus('matched');
              router.push(`/interview-room/${scheduleId}?token=${encodeURIComponent(livekitToken)}&room=${encodeURIComponent(livekitRoomName)}`);
              return;
            } catch (tokenError: any) {
              console.error('Failed to get LiveKit token:', tokenError);
              setError('Failed to set up video connection: ' + tokenError.message);
              setStatus('error');
              return;
            }
          }
        }
        
        if (scheduleDetails.status !== 'searching') {
          // If not in searching state, try to join now
          try {
            await scheduleService.joinInterview(scheduleId);
            setStatus('waiting');
          } catch (err: any) {
            setError(err.message || 'Failed to join interview');
            setStatus('error');
            return;
          }
        } else {
          // Already in searching state
          setStatus('waiting');
        }

        // Set up socket connection
        await socketService.connect();
        
        // Register event handlers
        socketService.registerHandlers({
          onMatch: async (data) => {
            try {
              // Get current user info
              const currentUser = authService.getCurrentUser();
              const displayName = currentUser ? 
                `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'User' 
                : 'User';
              
              // Create LiveKit room name using the schedule ID
              const livekitRoomName = `interview-${scheduleId}`;
              
              // Get LiveKit token
              const livekitToken = await livekitService.getToken(livekitRoomName, displayName);
              
              // Create match data with LiveKit token
              const matchData = {
                sessionId: scheduleId,
                token: livekitToken,
                roomName: livekitRoomName
              };
              
              // Store match data for future reference
              localStorage.setItem(`interview_session_${scheduleId}`, JSON.stringify(matchData));
              
              setStatus('matched');
              
              // Clear any countdown interval
              if (countdownInterval) clearInterval(countdownInterval);
              
              // Redirect to interview room with LiveKit parameters
              router.push(`/interview-room/${scheduleId}?token=${encodeURIComponent(livekitToken)}&room=${encodeURIComponent(livekitRoomName)}`);
            } catch (tokenError: any) {
              console.error('Failed to get LiveKit token:', tokenError);
              setError('Failed to set up video connection: ' + tokenError.message);
              setStatus('error');
            }
          },
          onTimeout: () => {
            setStatus('no-match');
            if (countdownInterval) clearInterval(countdownInterval);
          },
          onError: (err) => {
            setError('Connection error: ' + (err.message || 'Unknown error'));
            setStatus('error');
            if (countdownInterval) clearInterval(countdownInterval);
          }
        });
        
        // Join the matchmaking queue
        socketService.joinQueue(scheduleId);
        
        // Start countdown timer
        countdownInterval = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // If we reach 0 and no socket event happened, set to no-match
              // This is a fallback in case the socket timeout event doesn't arrive
              setStatus('no-match');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err: any) {
        console.error('Setup error:', err);
        setError(err.message || 'Failed to set up interview connection');
        setStatus('error');
      }
    };

    setupSocket();

    // Clean up on unmount
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      socketService.disconnect();
    };
  }, [scheduleId, router]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <h1 className="text-2xl font-bold mb-2">Connecting...</h1>
          <p className="text-gray-600">Setting up your interview session.</p>
        </div>
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <h1 className="text-2xl font-bold mb-2">Searching for a Match</h1>
          <p className="text-gray-600 mb-4">Looking for another participant for your interview.</p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-800">Time remaining: {formatTimeRemaining()}</p>
            <p className="text-xs text-purple-600 mt-1">You'll be automatically matched with another person.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'no-match') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">No Match Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find a peer for your interview within the time limit.</p>
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">You can try again or schedule for a different time when more users might be available.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStatus('loading');
                setTimeRemaining(120);
                window.location.reload();
              }}
              className="flex-1 bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/schedule')}
              className="flex-1 bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 transition"
            >
              Back to Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-red-500">Error</h1>
          <p className="text-gray-800 mb-4">{error || 'An unexpected error occurred'}</p>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-red-800">Please try again later or contact support if the problem persists.</p>
          </div>
          <button
            onClick={() => router.push('/schedule')}
            className="w-full bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 transition"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
        <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
        <p className="text-gray-600">Preparing your interview room.</p>
      </div>
    </div>
  );
}