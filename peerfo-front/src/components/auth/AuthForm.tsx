"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Github, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AuthFormProps, FormFieldProps, SocialButtonProps } from "@/lib/types"


/**
 * Form component for user authentication
 */
export function AuthForm({
  isSignIn,
  setIsSignIn,
  isLoading,
  onSubmit,
  onGoogleSignIn,
  onGithubSignIn
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  })

  
  //TODO: Add a Password Confirmation field for sign up
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="p-8 sm:p-12">
      <div className="mb-8">
        <Link href="/" className="text-xl font-serif text-gray-900 dark:text-white">
          peer<span className="text-purple-600">fo</span>
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-normal text-gray-900 dark:text-white">
          {isSignIn ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isSignIn
            ? "Sign in to your account to continue"
            : "Join thousands of peers improving their interview skills"}
        </p>
      </div>

      {/* Social Sign In */}
      <div className="mb-6 space-y-4">
        <SocialButton 
            provider="Google"
            onClick={onGoogleSignIn}
            disabled={isLoading} 
            icon={undefined}        
        />
        <SocialButton 
            provider="GitHub" 
            onClick={onGithubSignIn} 
            disabled={isLoading}
            icon={<Github className="h-5 w-5" />}
        />
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
      {!isSignIn && (
        <div className="flex flex-col sm:flex-row sm:space-x-4">
            <FormField
            id="firstName"
            label="First Name"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={handleChange}
            required
            icon={[]}
            />
            <FormField
            id="lastName"
            label="Last Name"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleChange}
            required
            icon={[]}
            />
        </div>
        )}


        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          icon={<Mail className="h-5 w-5" />}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            {isSignIn && (
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="pl-10 pr-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Lock className="h-5 w-5" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="relative mt-6 w-full overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-xl hover:shadow-purple-600/30"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              {isSignIn ? "Sign in" : "Create account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
        </span>{" "}
        <span
            onClick={() => setIsSignIn(!isSignIn)}
            className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 cursor-pointer dark:hover:text-purple-300"
        >
            {isSignIn ? "Sign up" : "Sign in"}
        </span>
       </div>
    </div>
  )
}

/**
 * Form field component with label and icon
 */
function FormField({ id, label, type, placeholder, value, onChange, required, icon }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="pl-10"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </div>
      </div>
    </div>
  )
}

/**
 * Social sign-in button component
 */
function SocialButton({ provider, onClick, disabled, icon }: SocialButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {provider === "Google" ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ) : (
        icon
      )}
      Continue with {provider}
    </Button>
  )
}