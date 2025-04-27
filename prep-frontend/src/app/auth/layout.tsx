import type React from "react"
import { Toaster } from "sonner"

export const metadata = {
  title: "Authentication - PeerPulse",
  description: "Sign in or create an account on PeerPulse",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          style: {
            border: "1px solid #e2e8f0",
            padding: "16px",
            borderRadius: "0.5rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      />
    </>
  )
}
