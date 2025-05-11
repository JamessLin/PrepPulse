'use client';

import { useEffect, useState } from 'react';
import { Room } from 'livekit-client';
import { LiveKitRoom } from '@livekit/components-react';

interface UseLiveKitResult {
  isConnecting: boolean;
  error: string | null;
  token: string | null;
  roomName: string | null;
}

/**
 * Custom hook to handle LiveKit room token fetching and connection
 */
export function useLiveKit(scheduleId: string): UseLiveKitResult {
  const [token, setToken] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      if (!scheduleId) return;
      
      try {
        setIsConnecting(true);
        setError(null);
        
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ roomName: `interview-${scheduleId}` })
        });
        
        if (!res.ok) {
          throw new Error('Failed to get LiveKit token');
        }
        
        const data = await res.json();
        setToken(data.token);
        setRoomName(data.roomName);
      } catch (err) {
        console.error('Error fetching LiveKit token:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to interview');
      } finally {
        setIsConnecting(false);
      }
    }
    
    fetchToken();
  }, [scheduleId]);

  return {
    isConnecting,
    error,
    token,
    roomName
  };
}

/**
 * LiveKit room wrapper component
 */
export function LiveKitRoomProvider({
  children,
  token,
  roomName
}: {
  children: React.ReactNode;
  token: string;
  roomName: string;
}) {
  if (!token || !roomName) {
    return null;
  }

  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;
  if (!wsUrl) {
    console.error('NEXT_PUBLIC_LIVEKIT_WS_URL not set');
    return null;
  }

  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      audio={true}
      video={true}
      data-lk-theme="default"
    >
      {children}
    </LiveKitRoom>
  );
} 