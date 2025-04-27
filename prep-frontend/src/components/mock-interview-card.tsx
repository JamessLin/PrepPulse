import { UserIcon } from "./ui/icons"
interface MockInterviewCardProps {
  title?: string
  time?: string
  interviewWith?: string
  duration?: string
  focus?: string
  className?: string
}

export function MockInterviewCard({
  title = "Mock Interview",
  time = "Today at 3:00 PM",
  interviewWith = "Alex",
  duration = "60 minutes",
  focus = "System Design",
  className = "",
}: MockInterviewCardProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -left-4 -top-4 h-72 w-72 rounded-3xl bg-purple-100/50 backdrop-blur-sm dark:bg-purple-900/10"></div>
      <div className="absolute -right-4 -bottom-4 h-72 w-72 rounded-3xl bg-indigo-100/50 backdrop-blur-sm dark:bg-indigo-900/10"></div>
      <div className="relative rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(8,_112,_184,_0.05)] dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 p-2 dark:bg-purple-900/20">
            <UserIcon className="h-8 w-8 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
            <p className="text-sm text-gray-700 dark:text-gray-300">Technical Interview with {interviewWith}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Focus</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{focus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
