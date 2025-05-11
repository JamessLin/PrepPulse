import React, { useState, useEffect } from 'react';
import { scheduleService } from '@/services/scheduleService';
import {
  LiveKitRoom,
  PreJoin,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { io, Socket } from 'socket.io-client';
import { authService } from '@/services/authService';

interface InterviewModalProps {
  scheduleId: string;
  onClose: () => void;
}

const InterviewModal: React.FC<InterviewModalProps> = ({ scheduleId, onClose }) => {
  const [modalState, setModalState] = useState<'searching' | 'matched' | 'prejoin' | 'joined' | 'timeout' | 'error'>('searching');
  const [remainingTime, setRemainingTime] = useState(120); // 2 minutes in seconds
  const [joinData, setJoinData] = useState<{ token: string; roomName: string; sessionId: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (modalState === 'searching') {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            setModalState('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Connect to Socket.IO
      const userId = authService.getCurrentUserId();
      if (!userId) {
        setModalState('error');
        setErrorMessage('User not authenticated');
        return;
      }

      const newSocket = io('http://localhost:5000', { // Updated port to 5000
        withCredentials: true,
        transports: ['websocket'],
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        newSocket.emit('joinQueue', { scheduleId, userId });

        // Join the queue via API
        scheduleService.joinInterview(scheduleId).catch((error) => {
          setModalState('error');
          setErrorMessage(error.message);
        });
      });

      newSocket.on('match', (data) => {
        clearInterval(timer);
        setJoinData(data);
        setModalState('matched');
      });

      newSocket.on('timeout', () => {
        clearInterval(timer);
        setModalState('timeout');
      });

      newSocket.on('connect_error', (error) => {
        clearInterval(timer);
        setModalState('error');
        setErrorMessage('Connection error: ' + error.message);
      });
    }

    return () => {
      if (timer) clearInterval(timer);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [modalState, scheduleId]);

  const handleJoinInterview = () => {
    setModalState('prejoin');
  };

  const handlePreJoinSubmit = () => {
    setModalState('joined');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        {modalState === 'searching' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Searching for a match...</h2>
            <p className="mb-4">Time remaining: {formatTime(remainingTime)}</p>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </>
        )}

        {modalState === 'matched' && joinData && (
          <>
            <h2 className="text-xl font-semibold mb-4">Match Found!</h2>
            <p className="mb-4">You have been matched with another user.</p>
            <button
              onClick={handleJoinInterview}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Join Interview
            </button>
            <button
              onClick={onClose}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </>
        )}

        {modalState === 'prejoin' && joinData && (
          <>
            <h2 className="text-xl font-semibold mb-4">Prepare to Join</h2>
            <PreJoin
              onSubmit={handlePreJoinSubmit}
              onError={(error) => {
                setModalState('error');
                setErrorMessage(error.message);
              }}
            />
            <button
              onClick={onClose}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </>
        )}

        {modalState === 'joined' && joinData && (
          <LiveKitRoom
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880'}
            token={joinData.token}
            connect={true}
            onDisconnected={onClose}
          >
            <VideoConference />
          </LiveKitRoom>
        )}

        {modalState === 'timeout' && (
          <>
            <h2 className="text-xl font-semibold mb-4">No Match Found</h2>
            <p className="mb-4">No match was found within 2 minutes. Please reschedule.</p>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </>
        )}

        {modalState === 'error' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Error</h2>
            <p className="mb-4">{errorMessage || 'An error occurred while joining the interview.'}</p>
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewModal;