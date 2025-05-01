import { ChangeEvent, FormEvent } from "react"

/**
 * Form data for authentication
 */
export interface AuthFormData {
    email: string
    password: string
    firstName?: string
    lastName?: string
}

/**
 * Props for the AuthForm component
 */
export interface AuthFormProps {
    isSignIn: boolean
    setIsSignIn: (isSignIn: boolean) => void
    isLoading: boolean
    onSubmit: (formData: AuthFormData) => void
    onGoogleSignIn: () => void
    onGithubSignIn: () => void
}

/**
 * Props for the FormField component
 */
export interface FormFieldProps {
    id: string
    label: string
    type: string
    placeholder: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    required: boolean
    icon: React.ReactNode
}

/**
 * Props for the SocialButton component
 */
export interface SocialButtonProps {
    provider: string
    onClick: () => void
    disabled: boolean
    icon?: React.ReactNode
}

/**
 * Props for the OnboardingStep component
 */
export interface OnboardingStepProps {
    resumeUploaded: boolean
    onResumeUpload: (file: File) => void
    onContinue: () => void
    onSkip: () => void
}

/**
 * Props for the FileUploadArea component
 */
export interface FileUploadAreaProps {
    resumeUploaded: boolean
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

/**
 * Props for the AuthContainer component
 */
export interface AuthContainerProps {
    children: React.ReactNode
}

export interface AuthResponse {
    message: string;
    user: any;
    session?: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
}

export interface ResumeUploadResponse {
    message: string;
    resumeUrl: string;
}