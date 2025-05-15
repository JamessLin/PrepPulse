"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter for potential redirects
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
  const router = useRouter(); // Initialize router
  const roomName = Array.isArray(params.room) ? params.room[0] : params.room;
  
  const [token, setToken] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [liveKitUrl, setLiveKitUrl] = useState<string | undefined>(process.env.NEXT_PUBLIC_LIVEKIT_URL);

  useEffect(() => {
    // Ensure roomName is available
    if (!roomName) {
      setError("Room name not found in URL.");
      setIsLoading(false);
      // Optionally redirect
      // router.push('/dashboard'); 
      return;
    }

    // Check if LiveKit URL is configured
    if (!liveKitUrl) {
       setError("LiveKit Server URL is not configured (NEXT_PUBLIC_LIVEKIT_URL).");
       setIsLoading(false);
       return;
    }
    
    console.log(`Attempting to retrieve credentials for room: ${roomName}`);

    // Retrieve token from localStorage
    const credentialsKey = `livekit_creds_${roomName}`;
    const storedCredentials = localStorage.getItem(credentialsKey);

    if (storedCredentials) {
      try {
        const parsedCredentials = JSON.parse(storedCredentials);
        if (parsedCredentials && parsedCredentials.token) {
          setToken(parsedCredentials.token);
          console.log(`Credentials found for room: ${roomName}`);
          // Optionally remove the credentials after retrieving them
          // localStorage.removeItem(credentialsKey); 
        } else {
          setError("Credentials found, but token is missing or invalid.");
          console.error(`Invalid credentials format in localStorage for key ${credentialsKey}:`, storedCredentials);
        }
      } catch (parseError) {
        console.error("Error parsing credentials from localStorage:", parseError);
        setError("Failed to parse stored credentials. Please try joining again.");
      }
    } else {
      console.warn(`No credentials found in localStorage for key: ${credentialsKey}`);
      setError("Session credentials not found. Please initiate the join process again.");
      // Optionally redirect user back to a page where they can join
      // router.push('/schedule'); 
    }

    setIsLoading(false);

  }, [roomName, liveKitUrl, router]); // Add router to dependency array if using it inside

  // --- Render states ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Loading interview room...</p>
        {/* You could add a spinner here */}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500 p-4 text-center">
        <p className="font-bold text-lg mb-2">Error Connecting to Interview</p>
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-400">If the problem persists, please try rejoining from your schedule.</p>
      </div>
    );
  }

  // ***** Add this console.log for debugging *****
  console.log('Before rendering LiveKitRoom:');
  console.log('Token type:', typeof token, 'Token value:', token);
  console.log('Room Name:', roomName);
  console.log('LiveKit URL:', liveKitUrl);
  // *********************************************

  if (!token || !roomName) { // Check token and roomName are present
    // This state might be briefly hit before error or loading state takes over,
    // but good to have a fallback.
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Preparing interview room...</p>
      </div>
    );
  }

  // LiveKit URL check is handled in useEffect now, but keep this as safeguard
  if (!liveKitUrl) {
     return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: LiveKit Server URL is missing configuration.
      </div>
    );
  }

  // --- Render LiveKit Room ---
  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }} data-lk-theme="default">
      <LiveKitRoom
        serverUrl={liveKitUrl}
        token={token}
        connect={true}
        audio={true}
        video={true}
        onDisconnected={() => {
            console.log('Disconnected from LiveKit room');
            // Optionally redirect or show a message on disconnect
            // setError("Disconnected from the interview room.");
            // router.push('/dashboard');
        }}
        onError={(e) => {
            console.error("LiveKit Room Error:", e);
            setError(`Connection error: ${e.message}`);
        }}
      >
        <VideoConference />
        
        {/* Optional: Add custom controls or overlays here if needed */}
        {/* 
        <ControlBar controls={{ microphone: true, camera: true, screenShare: false, chat: true, leave: true }} /> 
        */}
      </LiveKitRoom>

      {/* Placeholder for AI Generated Questions */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          width: '300px', 
          minHeight: '150px',
          background: 'rgba(255, 255, 255, 0.9)', 
          padding: '15px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          color: '#333' // Ensuring text is visible on light background
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>AI Generated Questions</h3>
        <p>Question 1 will appear here...</p>
        <p>Question 2 will appear here...</p>
        {/* More content can be added later */}
      </div>
    </div>
  );
} 