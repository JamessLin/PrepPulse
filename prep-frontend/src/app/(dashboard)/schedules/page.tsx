'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleService } from '@/services/scheduleService';

interface Schedule {
  scheduleId: string;
  scheduledTime: string;
  interviewType: string;
  matched: boolean;
  matchedWith?: { userId: string; name: string };
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await scheduleService.getUserSchedules();
        setSchedules(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load schedules');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const handleJoin = (scheduleId: string) => {
    router.push(`/interview/${scheduleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Loading Schedules...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">No Schedules</h1>
          <p>You have no scheduled interviews. Schedule one to get started!</p>
          <button
            onClick={() => router.push('/schedule')}
            className="mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Schedule Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Your Scheduled Interviews</h1>
      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.scheduleId}
            className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <p className="text-lg">
                <strong>Type:</strong> {schedule.interviewType}
              </p>
              <p>
                <strong>Time:</strong>{' '}
                {new Date(schedule.scheduledTime).toLocaleString()}
              </p>
              {schedule.matched && schedule.matchedWith && (
                <p>
                  <strong>Matched With:</strong> {schedule.matchedWith.name}
                </p>
              )}
              {!schedule.matched && <p className="text-yellow-500">Pending Match</p>}
            </div>
            <button
              onClick={() => handleJoin(schedule.scheduleId)}
              disabled={schedule.matched}
              className={`px-4 py-2 rounded-md ${
                schedule.matched
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {schedule.matched ? 'Joined' : 'Join'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}