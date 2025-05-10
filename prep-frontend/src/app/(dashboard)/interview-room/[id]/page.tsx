'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { livekitService } from '@/services/livekitService';
import { authService } from '@/services/authService';
import { Loader2, Video, Mic, MicOff, VideoOff, Phone } from 'lucide-react';
import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  RoomAudioRenderer,
  LayoutContextProvider,
  GridLayout,
  ParticipantTile
} from '@livekit/components-react';
import '@livekit/components-styles';

export default function InterviewRoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params?.id as string;
  const token = searchParams.get('token');
  const roomName = searchParams.get('room');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lkToken, setLkToken] = useState<string | null>(token);
  const [lkRoomName, setLkRoomName] = useState<string | null>(roomName);
  const [serverUrl, setServerUrl] = useState<string>(livekitService.getServerUrl());

  useEffect(() => {
    // Validate required parameters
    if (!sessionId) {
      setError('Invalid session ID');
      setIsLoading(false);
      return;
    }

    if (!token || !roomName) {
      setError('Missing required connection parameters');
      setIsLoading(false);
      return;
    }

    // Set loading to false since we have the token and room
    setIsLoading(false);

    // Return cleanup function
    return () => {
      console.log('Disconnecting from LiveKit room');
      // Cleanup will be handled by LiveKitRoom component
    };
  }, [sessionId, token, roomName]);

  const handleRoomDisconnect = () => {
    if (confirm('Are you sure you want to leave this interview?')) {
      router.push('/schedule');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-600" />
          <h1 className="mt-4 text-2xl font-bold">Joining Interview Room...</h1>
          <p className="mt-2 text-gray-600">Setting up your audio and video connection.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-red-500">Connection Error</h1>
          <p className="mt-4 text-gray-800">{error}</p>
          <button
            onClick={() => router.push('/schedule')}
            className="mt-6 w-full rounded-md bg-purple-600 p-2 text-white transition hover:bg-purple-700"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  if (!lkToken || !lkRoomName) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-red-500">Missing Connection Parameters</h1>
          <p className="mt-4 text-gray-800">Unable to connect to the interview room due to missing parameters.</p>
          <button
            onClick={() => router.push('/schedule')}
            className="mt-6 w-full rounded-md bg-purple-600 p-2 text-white transition hover:bg-purple-700"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <LiveKitRoom
        token={lkToken}
        serverUrl={serverUrl}
        connect={true}
        audio={true}
        video={true}
        onDisconnected={handleRoomDisconnect}
        data-lk-theme="default"
      >
        {/* Room audio processing - handles audio elements for us */}
        <RoomAudioRenderer />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 p-4 z-10">
          <h1 className="text-xl font-bold text-white">Interview Session</h1>
          <div className="text-sm text-gray-400">Room: {lkRoomName}</div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col md:flex-row relative">
          {/* Video conference area */}
          <div className="flex-1 bg-black">
            <LayoutContextProvider>
              <VideoConference />
            </LayoutContextProvider>
          </div>
          
          {/* Side panel */}
          <div className="w-full border-l border-gray-800 bg-gray-900 p-4 md:w-80">
            <h2 className="mb-4 text-lg font-bold text-white">Interview Info</h2>
            <div className="rounded bg-gray-800 p-4">
              <p className="text-sm text-gray-400">Session ID:</p>
              <p className="mb-2 text-sm text-white">{sessionId}</p>
              
              <div className="mt-4">
                <p className="text-sm text-gray-400">Timer:</p>
                <p className="text-lg font-semibold text-white">45:00</p>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-400">Questions:</p>
                <ul className="mt-1 space-y-2">
                  <li className="text-sm text-white bg-gray-700 p-2 rounded">Introduce yourself and your background.</li>
                  <li className="text-sm text-white bg-gray-700 p-2 rounded">What are your strengths and weaknesses?</li>
                  <li className="text-sm text-white bg-gray-700 p-2 rounded">Describe a challenging situation in your previous role.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Control bar */}
        <div className="bg-gray-900 border-t border-gray-800 z-10">
          <ControlBar variation="minimal" />
        </div>
      </LiveKitRoom>
    </div>
  );
} 