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
// import { resumeService } from "@/services/resumeService"



export default function AuthPage() {
  const router = useRouter()
  const [isSignIn, setIsSignIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const handleAuth = async (formData: AuthFormData) => {
    setIsLoading(true)

    try {
      if (isSignIn) {
        const response = await authService.login(formData)
        toast.success("Signed in successfully!")
        router.push("/")
      }else {

        await authService.register(formData)

        setRegistrationComplete(true)

        const loginResponse = await authService.login({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName, 
          lastName: formData.lastName,
        })
        setCurrentUser(loginResponse.user)

      }
    }catch (error: any) {
      toast.error(error.message || (isSignIn ? "Login failed" : "Registration failed"))
    }finally {
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
    if (file) {
      toast.success("Resume uploaded successfully!")
      setResumeUploaded(true)
    }
  }

  const handleContinue = () => {
    router.push("/")
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
          isLoading={isLoading}
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
        />
      )}
      <AuthHero />
    </AuthContainer>
  )
}