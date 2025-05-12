"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User2, Bot, Code, Users, Briefcase, Video, LucideIcon, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

// Card component for entry options
interface EntryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  bgColor: string;
  textColor: string;
}

const EntryCard = ({ title, description, icon: Icon, href, bgColor, textColor }: EntryCardProps) => (
  <Link 
    href={href}
    className="block rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-6"
  >
    <div className="flex items-start">
      <div className={`p-3 rounded-full ${bgColor} ${textColor} mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-medium text-lg text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  </Link>
);

export default function TestMeetPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  // Generate a unique room ID for quick join
  const quickJoinRoomId = `quick-${Math.random().toString(36).substring(2, 9)}`;
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/test-meet?room=${quickJoinRoomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleQuickJoin = () => {
    router.push(`/test-meet/advanced?mode=peer&type=technical&room=${quickJoinRoomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Interview Meeting Test</h1>
          <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
            Test LiveKit video meetings for interview practice without scheduling
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quick Join</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start a new technical interview session instantly and share the link
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleQuickJoin}
                  className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Video className="w-5 h-5" />
                  <span>Start New Meeting</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                >
                  {copied ? 'Copied!' : 'Copy Invite Link'}
                </button>
              </div>
            </div>
            <div className="w-32 h-32 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Video className="w-16 h-16 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Meeting Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <EntryCard 
            title="Simple Meeting"
            description="Basic video meeting with minimal UI for quick tests"
            icon={Video}
            href="/test-meet/simple"
            bgColor="bg-blue-100 dark:bg-blue-900/30"
            textColor="text-blue-600 dark:text-blue-400"
          />
          
          <EntryCard 
            title="Advanced Meeting"
            description="Full interview experience with different modes and types"
            icon={Settings}
            href="/test-meet/select"
            bgColor="bg-purple-100 dark:bg-purple-900/30"
            textColor="text-purple-600 dark:text-purple-400"
          />
        </div>
        
        <div className="flex justify-center">
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 font-medium dark:text-purple-400 dark:hover:text-purple-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 