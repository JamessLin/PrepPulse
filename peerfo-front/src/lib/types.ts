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
    isLoading?: boolean
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



//
//
/* Schedule Types*/   //FIXME: This is temp location of different types. Move to a better location later
//
//




/**
 * Props for the DateSelector component
 */
export interface DateSelectorProps {
    currentDate: Date
    selectedDate: Date
    today: Date
    maxBookingDate: Date
    onDateSelect: (date: Date) => void
    onPrevWeek: () => void
    onNextWeek: () => void
    canGoPrevious: boolean
    canGoNext: boolean
}

/**
 * Props for the InterviewTypeSelector component
 */
export interface InterviewType {
    id: string
    name: string
    description: string
    iconName: "Code" | "Users" | "Briefcase" | "Cpu"
}

export interface InterviewTypeSelectorProps {
    interviewTypes: InterviewType[]
    selectedType: string
    onSelectType: (typeId: string) => void
}


/**
 * Props for the TimeSelector component
 */ 
export interface TimeSlot {
    time: string
    disabled: boolean
}
  
export interface TimeSelectorProps {
    selectedDate: Date | null
    selectedTime: string   //TODO: Change to time type
    onTimeSelect: (time: string) => void
}
