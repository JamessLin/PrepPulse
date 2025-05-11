"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthContainer } from "@/components/auth/AuthContainer"
import { AuthHero } from "@/components/auth/AuthHero"
import { authService } from "@/services/authService"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In production, call the actual reset password API
      // await authService.requestPasswordReset(email)
      
      // Simulating API call for now
      setTimeout(() => {
        setIsLoading(false)
        setIsSubmitted(true)
        toast.success("Password reset link sent to your email")
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link")
      setIsLoading(false)
    }
  }

  return (
    <AuthContainer>
      <div className="flex w-full flex-col justify-center p-8 sm:p-12">
        <Link
          href="/auth"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>

        <div className="mt-6">
          <Link href="/" className="text-xl font-serif text-gray-900 dark:text-white">
            peer<span className="text-purple-600">fo</span>
          </Link>
          <h1 className="mt-6 font-serif text-3xl font-normal text-gray-900 dark:text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="mt-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-normal text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSubmitted(false)}
                className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                try again
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-xl hover:shadow-purple-600/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        )}
      </div>
      <AuthHero />
    </AuthContainer>
  )
}