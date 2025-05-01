"use client"

import React from "react"
import { AuthContainerProps } from "@/lib/types"

/**
 * Container component for the authentication page
 * Provides layout and background styles
 */
export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 opacity-30 blur-3xl dark:from-purple-900/20 dark:to-indigo-900/20" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-30 blur-3xl dark:from-blue-900/20 dark:to-indigo-900/20" />
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-[480px] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-2">
          {children}
        </div>
      </div>
    </div>
  )
}
