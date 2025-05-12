"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User2, Bot, Code, Users, Briefcase } from "lucide-react";

export default function TestMeetSelectPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'peer' | 'ai'>('peer');
  const [type, setType] = useState<'technical' | 'behavioral' | 'system-design'>('technical');
  const [room, setRoom] = useState('');
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleModeSelect = (selectedMode: 'peer' | 'ai') => {
    setMode(selectedMode);
  };

  const handleTypeSelect = (selectedType: 'technical' | 'behavioral' | 'system-design') => {
    setType(selectedType);
  };

  const handleJoin = () => {
    setIsJoining(true);
    const roomParam = isCustomRoom && room ? `&room=${room}` : '';
    router.push(`/test-meet/advanced?mode=${mode}&type=${type}${roomParam}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Test Interview Meeting</h1>
          <p className="mt-1 opacity-80">Choose your interview mode and type to start a test session</p>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Interview Mode</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleModeSelect('peer')}
                className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                  mode === 'peer'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800/30'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  mode === 'peer' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <User2 className="w-5 h-5" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">Peer-to-Peer</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connect with another person</p>
                </div>
              </button>
              
              <button
                onClick={() => handleModeSelect('ai')}
                className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                  mode === 'ai'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800/30'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  mode === 'ai' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div className="ml-4 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">AI Interviewer</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Practice with AI (simulated)</p>
                </div>
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Interview Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleTypeSelect('technical')}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  type === 'technical'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800/30'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 ${
                  type === 'technical' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Technical</h3>
              </button>
              
              <button
                onClick={() => handleTypeSelect('behavioral')}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  type === 'behavioral'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800/30'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 ${
                  type === 'behavioral' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Behavioral</h3>
              </button>
              
              <button
                onClick={() => handleTypeSelect('system-design')}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  type === 'system-design'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800/30'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 ${
                  type === 'system-design' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">System Design</h3>
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <label className="text-lg font-medium text-gray-900 dark:text-white">Room Settings</label>
              <div className="ml-auto">
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Custom Room ID</span>
                  <input
                    type="checkbox"
                    checked={isCustomRoom}
                    onChange={() => setIsCustomRoom(!isCustomRoom)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            
            {isCustomRoom && (
              <div className="mb-3">
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Room ID (optional)
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Enter a custom room ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Use this to create or join a specific room
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-purple-600 hover:text-purple-700 font-medium dark:text-purple-400 dark:hover:text-purple-300"
            >
              Back to Home
            </Link>
            
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isJoining ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Joining...
                </>
              ) : (
                'Start Interview'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 