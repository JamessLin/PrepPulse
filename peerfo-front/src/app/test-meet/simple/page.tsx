"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// LiveKit React components
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SimpleTestMeetPage() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('room') || `simple-${Math.random().toString(36).substring(2, 9)}`;
  
  const [token, setToken] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Handle copy room link
  const handleCopyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      {/* Mini toolbar for room info and sharing */}
      <div className="absolute top-2 left-2 right-2 z-50 bg-black/50 rounded-lg px-3 py-2 flex items-center justify-between">
        <div className="text-white text-sm">
          Room: {roomName}
        </div>
        <button 
          onClick={handleCopyRoomLink}
          className="text-white text-sm py-1 px-3 bg-purple-600 rounded hover:bg-purple-700 transition"
        >
          {copied ? 'Copied!' : 'Copy Invite Link'}
        </button>
      </div>

      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://prepfo-3e4z4l3i.livekit.cloud'}
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