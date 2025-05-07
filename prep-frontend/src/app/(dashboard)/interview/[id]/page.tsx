'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { scheduleService } from '@/services/scheduleService';

export default function JoinInterviewPage() {
  const [status, setStatus] = useState<'waiting' | 'matched' | 'no-match' | 'error'>('waiting');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { scheduleId } = useParams();

  useEffect(() => {
    const attemptJoin = async () => {
      if (!scheduleId || typeof scheduleId !== 'string') {
        setError('Invalid schedule ID');
        setStatus('error');
        return;
      }

      try {
        const { sessionId, token, roomName } = await scheduleService.joinInterview(scheduleId);
        if (sessionId && token && roomName) {
          setStatus('matched');
          router.push(`/interview/${sessionId}?token=${encodeURIComponent(token)}&room=${encodeURIComponent(roomName)}`);
        }
      } catch (err: any) {
        if (err.message === 'Waiting for a match') {
          setStatus('waiting');
        } else if (err.message.includes('No match found within 2 minutes')) {
          setStatus('no-match');
        } else {
          setError(err.message || 'Failed to join interview');
          setStatus('error');
        }
      }
    };

    attemptJoin();

    // Poll every 5 seconds while waiting for a match
    const interval = setInterval(attemptJoin, 5000);
    return () => clearInterval(interval);
  }, [scheduleId, router]);

  if (status === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">Joining Interview...</h1>
          <p>Waiting for a match. This may take up to 2 minutes.</p>
        </div>
      </div>
    );
  }

  if (status === 'no-match') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">No Match Found</h1>
          <p>No peer was found for your interview. Please schedule another time.</p>
          <button
            onClick={() => router.push('/schedule')}
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Schedule Another Interview
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-red-500">Error</h1>
          <p>{error}</p>
          <button
            onClick={() => router.push('/schedule')}
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  return <div>Redirecting to interview...</div>;
}