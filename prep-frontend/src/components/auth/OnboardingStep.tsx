"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileUploadAreaProps, OnboardingStepProps } from "@/lib/types"

/**
 * Onboarding step component for new user registration
 */
export function OnboardingStep({ 
  resumeUploaded, 
  onResumeUpload, 
  onContinue, 
  onSkip,
  isLoading = false
}: OnboardingStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onResumeUpload(e.target.files[0])
    }
  }

  return (
    <div className="p-8 sm:p-12">
      <div className="mb-8">
        <Link href="/" className="text-xl font-serif text-gray-900 dark:text-white">
          peer<span className="text-purple-600">fo</span>
        </Link>
        <h1 className="mt-6 font-serif text-3xl font-normal text-gray-900 dark:text-white">
          Complete your profile
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload your resume to help us match you with the right peers
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <FileUploadArea 
          resumeUploaded={resumeUploaded} 
          onChange={handleFileChange} 
        />

        <div className="flex flex-row space-x-4">
            <Button
                onClick={onSkip}
                disabled={isLoading}
                className="flex-1 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Skip for now
            </Button>
            <Button
                onClick={onContinue}
                disabled={!resumeUploaded || isLoading}
                className={`flex-1 rounded-full ${
                    resumeUploaded && !isLoading
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20 hover:shadow-xl hover:shadow-purple-600/30"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
            >
              {isLoading ? "Uploading..." : "Continue"}
            </Button>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          You can always upload your resume later in your profile settings
        </p> 
      </div>
    </div>
  )
}

/**
 * File upload area component
 */
function FileUploadArea({ resumeUploaded, onChange }: FileUploadAreaProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-4 flex text-sm text-gray-600 dark:text-gray-400">
        <label
          htmlFor="file-upload"
          className="relative cursor-pointer rounded-md font-medium text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <span>Upload a file</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept=".pdf"
            onChange={onChange}
          />
        </label>
        <p className="pl-1">or drag and drop</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">PDF only, up to 5MB</p>
      {resumeUploaded && (
        <div className="mt-4 flex items-center text-sm text-green-600">
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          File selected successfully
        </div>
      )}
    </div>
  )
}