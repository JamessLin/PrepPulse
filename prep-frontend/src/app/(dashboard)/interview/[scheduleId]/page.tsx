'use client';

import { useLiveKit, LiveKitRoomProvider } from '@/hooks/useLiveKit';
import { VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';

/**
 * Main interview room component for video interviews
 */
export default function InterviewRoom({ params }: { params: { scheduleId: string } }) {
  const { scheduleId } = params;
  const { isConnecting, error, token, roomName } = useLiveKit(scheduleId);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting || !token || !roomName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-md text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connecting to Interview</h2>
          <div className="animate-pulse flex space-x-2 justify-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoomProvider token={token} roomName={roomName}>
      <InterviewRoomContent scheduleId={scheduleId} />
    </LiveKitRoomProvider>
  );
}

/**
 * Room content component that renders participants
 */
function InterviewRoomContent({ scheduleId }: { scheduleId: string }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Interview Session</h1>
        <p className="mb-4">Schedule ID: {scheduleId}</p>
        
        <div className="w-full h-[70vh]">
          <VideoConference />
        </div>
      </div>
    </div>
  );
} 