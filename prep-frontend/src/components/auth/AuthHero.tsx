"use client"

/**
 * Hero section for the authentication page
 */
export function AuthHero() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 lg:block">
      {/* Background elements */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-white">
        <div className="mb-8 rounded-full bg-white/10 p-3 backdrop-blur-sm">
          <svg
            className="h-10 w-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M3 21C3 18.2386 7.02944 16 12 16C16.9706 16 21 18.2386 21 21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="font-serif text-3xl font-normal">Elevate Your Interview Skills</h2>
        <p className="mt-4 text-center text-purple-100">
          Join thousands of professionals who are improving their interview skills with peerfo.
        </p>

        <BenefitsList />

        <UserStats />
      </div>
    </div>
  )
}

/**
 * List of benefits
 */
function BenefitsList() {
  const benefits = [
    "Connect with peers from top companies",
    "Practice with real interview questions",
    "Get structured feedback to improve"
  ]
  
  return (
    <div className="mt-12 space-y-6">
      {benefits.map((benefit, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12L10 17L19 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm text-purple-100">{benefit}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * User stats display
 */
function UserStats() {
  return (
    <div className="mt-12 flex items-center gap-4">
      <div className="flex -space-x-2">
        <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-indigo-600 bg-purple-200">
          <img src="/placeholder.svg?height=32&width=32" alt="User" />
        </div>
        <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-indigo-600 bg-purple-200">
          <img src="/placeholder.svg?height=32&width=32" alt="User" />
        </div>
        <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-indigo-600 bg-purple-200">
          <img src="/placeholder.svg?height=32&width=32" alt="User" />
        </div>
      </div>
      <p className="text-sm text-purple-100">Join 5,000+ users already on peerfo</p>
    </div>
  )
}