"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// LiveKit React components
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  useTracks,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface MeetingParams {
  mode: 'peer' | 'ai';
  type: 'technical' | 'behavioral' | 'system-design';
}

export default function AdvancedTestMeetPage() {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');
  const modeParam = searchParams.get('mode') as MeetingParams['mode'] || 'peer';
  const typeParam = searchParams.get('type') as MeetingParams['type'] || 'technical';
  
  // Generate a consistent room name based on the requested mode and type
  const roomName = roomParam || `${modeParam}-${typeParam}-${generateRoomId()}`;
  
  const [token, setToken] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isAIMode, setIsAIMode] = useState(modeParam === 'ai');
  const [interviewType, setInterviewType] = useState(typeParam);
  const [waitingForPeer, setWaitingForPeer] = useState(false);
  const [peerJoined, setPeerJoined] = useState(false);
  const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);
  
  // Room reference to add event listeners
  const roomRef = useRef<any>(null);

  useEffect(() => {
    const getUserInfo = async () => {
      // Get user info from Supabase if signed in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(`${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email || 'User');
      } else {
        setUserName(`Guest-${Math.floor(Math.random() * 10000)}`);
      }
    };
    
    getUserInfo();
  }, []);

  useEffect(() => {
    const getToken = async () => {
      setIsConnecting(true);
      setError(null);
      
      try {
        // Try to get authenticated token first
        const { data: { session } } = await supabase.auth.getSession();
        
        let url = `${API_URL}/livekit/test-token`;
        let options: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            roomName,
            // If we have a user name, use it for the test identity
            identity: userName || undefined
          }),
        };
        
        // If authenticated, use the authenticated endpoint
        if (session?.access_token) {
          url = `${API_URL}/livekit/token`;
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${session.access_token}`
          };
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get token');
        }
        
        const data = await response.json();
        setToken(data.token);
      } catch (err: any) {
        console.error('Error getting token:', err);
        setError(err.message || 'Failed to connect to meeting room');
      } finally {
        setIsConnecting(false);
      }
    };
    
    if (userName) {
      getToken();
    }
  }, [roomName, userName]);

  // Handle connecting to the room
  const handleRoomConnected = (room: any) => {
    roomRef.current = room;
    
    // Setting up event listeners
    room.on(RoomEvent.ParticipantConnected, () => {
      console.log('Participant connected');
      updateParticipants(room);
      setPeerJoined(room.participants.size > 0);
      setWaitingForPeer(false);
    });
    
    room.on(RoomEvent.ParticipantDisconnected, () => {
      console.log('Participant disconnected');
      updateParticipants(room);
      setPeerJoined(room.participants.size > 0);
    });
    
    // Initial check
    updateParticipants(room);
    setPeerJoined(room.participants.size > 0);
    setWaitingForPeer(modeParam === 'peer' && room.participants.size === 0);
    
    // In AI mode, we simulate an AI interviewer joining after a short delay
    if (isAIMode && !peerJoined) {
      simulateAIJoining();
    }
  };
  
  // Update the list of participants
  const updateParticipants = (room: any) => {
    const allParticipants = [room.localParticipant];
    room.participants.forEach((participant: any) => {
      allParticipants.push(participant);
    });
    setParticipants(allParticipants);
  };
  
  // Simulate AI joining (in a real implementation, this would be an actual AI service)
  const simulateAIJoining = () => {
    // In a real implementation, this is where you would connect to an AI service
    // For now, we'll just simulate the AI showing up after a delay
    console.log('Simulating AI joining...');
    setTimeout(() => {
      setPeerJoined(true);
      setWaitingForPeer(false);
    }, 3000);
  };
  
  // Get an interview greeting based on the type
  const getInterviewGreeting = () => {
    switch (interviewType) {
      case 'technical':
        return "Welcome to your technical interview! We'll be discussing coding problems, algorithms, and data structures.";
      case 'behavioral':
        return "Welcome to your behavioral interview! We'll be discussing your past experiences and how you handle various work situations.";
      case 'system-design':
        return "Welcome to your system design interview! We'll be discussing how you would design large-scale systems and architecture.";
      default:
        return "Welcome to your interview!";
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Connecting to meeting room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Connection Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="h-screen w-screen relative">
      {/* Interview context banner - only shown when connected */}
      {(peerJoined || isAIMode) && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-purple-600 text-white py-2 px-4 text-center">
          <p className="text-sm font-medium">{getInterviewGreeting()}</p>
          <p className="text-xs opacity-80">
            Mode: {isAIMode ? 'AI Interviewer' : 'Peer-to-Peer'} | Type: {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)}
          </p>
        </div>
      )}
      
      {/* Waiting for peer overlay */}
      {waitingForPeer && (
        <div className="absolute inset-0 z-40 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="animate-pulse mb-4">
              <div className="h-12 w-12 rounded-full bg-purple-200 dark:bg-purple-900 mx-auto"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Waiting for a peer...</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share this URL with someone to join your interview:
            </p>
            <div className="mt-3 flex">
              <input 
                type="text" 
                value={window.location.href}
                readOnly
                className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 text-sm"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('URL copied to clipboard!');
                }}
                className="bg-purple-600 text-white rounded-r-md px-3 hover:bg-purple-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
      
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://prepfo-3e4z4l3i.livekit.cloud'}
        // @ts-ignore - The LiveKit types are incorrect; onConnected actually does receive a room parameter
        onConnected={handleRoomConnected}
        options={{
          publishDefaults: { simulcast: true },
          adaptiveStream: true,
          dynacast: true,
        }}
        className="h-full"
        data-lk-theme="default"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

// Helper function to generate a random room ID
function generateRoomId() {
  return `${Math.random().toString(36).substring(2, 9)}`;
} 