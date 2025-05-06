import { format } from "date-fns"
import { CheckCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  interviewType: string
  date: Date
  time: string
  scheduleId?: string
  onViewSchedule?: () => void
}

export function ConfirmationModal({
  isOpen,
  onClose,
  interviewType,
  date,
  time,
  scheduleId,
  onViewSchedule
}: ConfirmationModalProps) {
  const formattedDate = format(date, "EEEE, MMMM d, yyyy")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Interview Scheduled!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your interview has been scheduled successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Interview Type
            </p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {interviewType} Interview
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Date & Time
            </p>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {formattedDate} at {time}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Next Steps
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              You'll be notified when you're matched with a peer. Be sure to join the
              session 5 minutes before the scheduled time.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="mt-3 rounded-full sm:mt-0"
          >
            Close
          </Button>
          
          {scheduleId && onViewSchedule && (
            <Button
              type="button"
              onClick={onViewSchedule}
              className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_14px_rgba(107,70,193,0.3)] hover:shadow-[0_6px_20px_rgba(107,70,193,0.4)]"
            >
              View Interview Details
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}