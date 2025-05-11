"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AuthForm } from "@/components/auth/AuthForm" //The component that handles the sign in and sign up forms
import { OnboardingStep } from "@/components/auth/OnboardingStep" //The component that handles the resume upload and continue button
import { AuthHero } from "@/components/auth/AuthHero" //The image on the right side of the page
import { AuthContainer } from "@/components/auth/AuthContainer"//The box

import { AuthFormData } from "@/lib/types"
import { authService } from "@/services/authService"
import { resumeService } from "@/services/resumeService"
import { useAuth } from "@/context/authContext"

export default function AuthPage() {
  const router = useRouter()
  const { login, register, isLoading: authLoading } = useAuth()
  
  const [isSignIn, setIsSignIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const handleAuth = async (formData: AuthFormData) => {
    setIsLoading(true)

    try {
      if (isSignIn) {
        await login(formData)
        // The useAuth hook will handle redirection and toast
      } else {
        await register(formData)
        
        // After registration, automatically log in
        const loginResult = await login(formData)
        setRegistrationComplete(true)
      }
    } catch (error: any) {
      // Error handling is done by useAuth hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      if (!isSignIn) {
        setRegistrationComplete(true)
      } else {
        toast.success(`Signed in with ${provider}!`)
        router.push("/")
      }
    }, 1500)
  }

  const handleResumeUpload = (file: File) => {
    // Store the file for later upload
    setResumeFile(file)
    setResumeUploaded(true)
    toast.success("Resume ready for upload")
  }

  const handleContinue = async () => {
    if (resumeFile) {
      setUploadingResume(true)
      try {
        // Upload the resume with public visibility set to false by default
        const response = await resumeService.uploadResume(resumeFile, false)
        toast.success("Resume uploaded successfully!")
        router.push("/")
      } catch (error: any) {
        toast.error(error.message || "Failed to upload resume")
        // Still allow navigation even if upload fails
        router.push("/")
      } finally {
        setUploadingResume(false)
      }
    } else {
      router.push("/")
    }
  }

  const skipResumeUpload = () => {
    toast.info("You can add your resume later in settings")
    router.push("/")
  }

  return (
    <AuthContainer>
      {!registrationComplete ? (
        <AuthForm 
          isSignIn={isSignIn}
          setIsSignIn={setIsSignIn}
          isLoading={isLoading || authLoading}
          onSubmit={handleAuth}
          onGoogleSignIn={() => handleSocialAuth("Google")}
          onGithubSignIn={() => handleSocialAuth("GitHub")}
        />
      ) : (
        <OnboardingStep 
          resumeUploaded={resumeUploaded}
          onResumeUpload={handleResumeUpload}
          onContinue={handleContinue}
          onSkip={skipResumeUpload}
          isLoading={uploadingResume}
        />
      )}
      {/* <AuthHero /> */}
    </AuthContainer>
  )
}