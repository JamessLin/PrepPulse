// app/dashboard/interview/[room]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // Removed useSearchParams as it's not strictly needed for this direct test mode
import {
  LiveKitRoom,
  VideoConference,
  // ControlBar, 
  // ParticipantTile,
} from '@livekit/components-react';
import '@livekit/components-styles'; 


// Main component for the interview room page
export default function InterviewRoomPage() {
  const params = useParams();
  const pageRoomName = Array.isArray(params.room) ? params.room[0] : params.room;
  
  const [token, setToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [liveKitUrl, setLiveKitUrl] = useState<string | undefined>(process.env.NEXT_PUBLIC_LIVEKIT_URL);
  const [effectiveRoomName, setEffectiveRoomName] = useState<string | undefined>(pageRoomName);

  useEffect(() => {
    let roomQueryParamForTest: string = pageRoomName || '';

    // If roomName from URL is something generic for testing, 
    // let backend generate a unique one to avoid collisions if multiple people test with /interview/test
    if (pageRoomName === 'test' || pageRoomName === 'default' || !pageRoomName) {
      roomQueryParamForTest = ''; // Backend will generate a UUID-based room name
    }

    console.log(`Direct navigation: Attempting to fetch test token for room: ${roomQueryParamForTest || '(backend-generated)'}`);
    
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
      setError("API base URL (NEXT_PUBLIC_API_URL) is not configured in frontend environment variables.");
      return;
    }

    fetch(`${apiBase}/livekit/test-token?roomName=${encodeURIComponent(roomQueryParamForTest)}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => { 
            throw new Error(errData.error || `Failed to fetch test token: ${res.status} ${res.statusText}`); 
          });
        }
        return res.json();
      })
      .then(data => {
        if (data.token && data.roomName && data.url) {
          setToken(data.token);
          setEffectiveRoomName(data.roomName);
          setLiveKitUrl(data.url);
          console.log(`Test token received for room: ${data.roomName}, user: ${data.userId}`);
        } else {
          setError("Invalid test token data received from backend.");
        }
      })
      .catch(err => {
        console.error("Error fetching test token:", err);
        setError(err.message || "Failed to fetch test token. Check backend logs.");
      });
      
  }, [pageRoomName]); // Re-run if pageRoomName (from URL) changes

  // --- Render states ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500 p-4 text-center">
        <p className="font-bold text-lg mb-2">Error Connecting to Interview</p>
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-400">Please ensure the backend server is running and environment variables (NEXT_PUBLIC_API_BASE, NEXT_PUBLIC_LIVEKIT_URL, and backend LiveKit/Supabase keys) are correctly set.</p>
      </div>
    );
  }

  // ***** Add this console.log for debugging *****
  console.log('Before rendering LiveKitRoom:');
  console.log('Token type:', typeof token, 'Token value:', token);
  console.log('Effective Room Name:', effectiveRoomName);
  console.log('LiveKit URL:', liveKitUrl);
  // *********************************************

  if (!token || !effectiveRoomName) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading interview room...</p>
        {/* You could add a spinner here */}
      </div>
    );
  }

  if (!liveKitUrl) {
     return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: LiveKit Server URL is not configured (NEXT_PUBLIC_LIVEKIT_URL).
      </div>
    );
  }

  // --- Render LiveKit Room ---
  return (
    <div style={{ height: '100vh', width: '100vw' }} data-lk-theme="default">
      <LiveKitRoom
        serverUrl={liveKitUrl}
        token={token}
        connect={true}
        audio={true}
        video={true}
        onDisconnected={() => console.log('Disconnected from LiveKit room')}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}