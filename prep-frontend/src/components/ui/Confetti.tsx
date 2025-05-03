"use client"

export function Confetti() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-confetti-1 absolute w-2 h-8 bg-purple-500 rounded-full"></div>
        <div className="animate-confetti-2 absolute w-2 h-8 bg-indigo-500 rounded-full"></div>
        <div className="animate-confetti-3 absolute w-2 h-8 bg-pink-500 rounded-full"></div>
        <div className="animate-confetti-4 absolute w-2 h-8 bg-blue-500 rounded-full"></div>
        <div className="animate-confetti-5 absolute w-2 h-8 bg-green-500 rounded-full"></div>
        <div className="animate-confetti-6 absolute w-2 h-8 bg-yellow-500 rounded-full"></div>
      </div>
    </div>
  )
}