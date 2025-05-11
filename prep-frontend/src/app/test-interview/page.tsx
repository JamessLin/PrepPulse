// pages/test-conference.tsx
'use client';

import { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

export default function TestConference() {
    console.log('test' + process.env.NEXT_PUBLIC_API_URL);
    console.log(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const WS_URL  = 'wss://peerfo-iod1pvif.livekit.cloud'; // must be wss://...

  const [roomName, setRoomName] = useState('');
  const [token, setToken]     = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // When user submits the form, fetch a test-token from your Express backend
  const joinRoom = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/livekit/test-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Status ${res.status}`);
      }
      const body = await res.json();
      setToken(body.token);
      setActiveRoom(body.roomName);
    } catch (e: any) {
      console.error('Failed to fetch LiveKit test token:', e);
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = () => {
    setActiveRoom(null);
    setToken(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = roomName.trim() || 'test-room';
    joinRoom(name);
  };

  // If we have a token & room, show the video conference
  if (activeRoom && token) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="p-4 bg-gray-100 flex justify-between items-center">
          <h1 className="text-xl">Room: {activeRoom}</h1>
          <button
            onClick={leaveRoom}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Leave
          </button>
        </header>
        <main className="flex-1 p-4">
          <LiveKitRoom
            serverUrl={WS_URL}
            token={token}
            connect={true}
            audio={true}
            video={true}
            data-lk-theme="default"
            onMediaDeviceFailure={(error) => {
              console.error('Media device failure:', error);
              alert(`Camera/Mic error: ${error?.toString() || 'Unknown error'}`);
            }}
          >
            <VideoConference />
          </LiveKitRoom>
        </main>
      </div>
    );
  }

  // Otherwise, show the join form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl mb-4">Join Test Conference</h2>
        <label className="block mb-3">
          <span className="block text-sm font-medium text-gray-700">Room Name</span>
          <input
            type="text"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            placeholder="e.g. test-room"
            className="mt-1 block w-full border px-3 py-2 rounded"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Joining…' : 'Join'}
        </button>
        {error && <p className="mt-3 text-red-500">Error: {error}</p>}
        <p className="mt-4 text-sm text-gray-600">
          Open this page in multiple tabs/devices with the same room name to test multi-user video.
        </p>
      </form>
    </div>
  );
}
