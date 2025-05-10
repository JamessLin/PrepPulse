import Link from "next/link"
import { ArrowRight, Sparkles, Shield, Star, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section with Private Beta Badge */}
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-white dark:bg-gray-950" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 opacity-30 blur-3xl dark:from-purple-900/20 dark:to-indigo-900/20" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-30 blur-3xl dark:from-blue-900/20 dark:to-indigo-900/20" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
          <div className="text-center lg:text-left lg:w-1/2">
            <div className="mb-6 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Private Beta
            </div>
            <h1 className="font-serif text-5xl font-normal tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
              <span className="block">Practice Interviews</span>
              <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                with AI & Peers
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 lg:mx-0 lg:max-w-md">
              Join our exclusive beta and elevate your interview skills with our AI-powered platform and peer matching
              system.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="/schedule"
                className="relative inline-flex h-12 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 p-[1px]"
              >
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-purple-700 transition-all duration-300 ease-out hover:bg-opacity-0 hover:text-white dark:bg-gray-950 dark:text-purple-300 dark:hover:bg-opacity-0 dark:hover:text-white">
                  Request Access <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </a>
              <a
                href="#features"
                className="relative inline-flex h-12 overflow-hidden rounded-full border border-gray-200 p-[1px] dark:border-gray-800"
              >
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-gray-700 transition-all duration-300 ease-out hover:bg-gray-50 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900">
                  Learn More
                </span>
              </a>
            </div>

            {/* Beta Stats */}
            <div className="mt-8 inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <Shield className="mr-2 h-4 w-4 text-purple-500" />
              <span>
                Limited access ·{" "}
                <span className="font-medium text-purple-600 dark:text-purple-400">87% of waitlist spots filled</span>
              </span>
            </div>
          </div>

          {/* AI Interview Preview */}
          <div className="hidden lg:block lg:w-1/2">
            <div className="relative ml-10 mt-10">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                {/* Header */}
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex items-center">
                    <div className="flex space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-sm font-medium text-gray-600 dark:text-gray-400">
                      AI Interview Session
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4 flex items-start">
                    <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                      <span className="font-medium">AI</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3 dark:bg-gray-800">
                      <p className="text-gray-700 dark:text-gray-300">
                        Tell me about a challenging project you worked on and how you overcame obstacles.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-start justify-end">
                    <div className="rounded-2xl rounded-tr-none bg-purple-100 px-4 py-3 dark:bg-purple-900/30">
                      <p className="text-gray-700 dark:text-gray-300">
                        In my last role, I led a team that was tasked with migrating our legacy system to a modern
                        architecture...
                      </p>
                    </div>
                    <div className="ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                      <span className="font-medium">You</span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-start">
                    <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                      <span className="font-medium">AI</span>
                    </div>
                    <div className="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3 dark:bg-gray-800">
                      <p className="text-gray-700 dark:text-gray-300">
                        Great start. Could you elaborate on the specific challenges you faced and your approach to
                        solving them?
                      </p>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex items-start justify-end">
                    <div className="rounded-2xl rounded-tr-none bg-purple-50 px-4 py-3 dark:bg-purple-900/20">
                      <div className="flex space-x-2">
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-purple-600 dark:bg-purple-400"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                      <span className="font-medium">You</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        AI Interviewer
                      </span>
                      <span>Technical Interview</span>
                    </div>
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">12:42 remaining</div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -right-4 -top-4 rounded-full bg-white px-3 py-1 text-sm font-medium text-purple-700 shadow-md dark:bg-gray-800 dark:text-purple-300">
                <Sparkles className="mr-1 inline-block h-3.5 w-3.5" />
                AI-Powered
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-full bg-white px-3 py-1 text-sm font-medium text-indigo-700 shadow-md dark:bg-gray-800 dark:text-indigo-300">
                <Star className="mr-1 inline-block h-3.5 w-3.5" />
                Beta Feature
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Access Section */}
      <section className="bg-white py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-normal text-gray-900 dark:text-white sm:text-4xl">
              Exclusive Beta Access
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              We're currently inviting a limited number of users to our private beta
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-purple-900/20 dark:to-purple-900/10"></div>
              <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
                <svg
                  className="h-8 w-8 text-purple-600 dark:text-purple-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16V8M12 8L9 11M12 8L15 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">Request an Invite</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Join our waitlist to get early access to our private beta. Limited spots available.
              </p>
              <div className="mt-6">
                <Button className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  Join Waitlist
                </Button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-indigo-900/20 dark:to-indigo-900/10"></div>
              <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                <svg
                  className="h-8 w-8 text-indigo-600 dark:text-indigo-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">Use Invite Code</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Already have an invite code? Redeem it here to get immediate access to the beta.
              </p>
              <div className="mt-6">
                <Button className="w-full rounded-full bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700">
                  Redeem Code
                </Button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-blue-900/20 dark:to-blue-900/10"></div>
              <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <svg
                  className="h-8 w-8 text-blue-600 dark:text-blue-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 8H17M7 12H17M7 16H13M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">Beta Updates</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Subscribe to our newsletter to get updates on our beta program and new features.
              </p>
              <div className="mt-6">
                <Button className="w-full rounded-full bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Beta Features
            </div>
            <h2 className="font-serif text-3xl font-normal text-gray-900 dark:text-white sm:text-4xl">
              Exclusive Beta Features
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
              Get early access to our cutting-edge interview preparation tools
            </p>
          </div>

          <div className="mt-20 grid gap-12 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-purple-900/20 dark:to-purple-900/10"></div>
              <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
                <svg
                  className="h-8 w-8 text-purple-600 dark:text-purple-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 3H15M12 3V21M12 21H17M12 21H7M7 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H7M17 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">AI Interview Practice</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Practice with our advanced AI interviewer that adapts to your responses and provides real-time feedback.
              </p>
              <div className="mt-4 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <Sparkles className="mr-1 h-3 w-3" />
                New
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-indigo-900/20 dark:to-indigo-900/10"></div>
              <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                <svg
                  className="h-8 w-8 text-indigo-600 dark:text-indigo-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M3 21C3 18.2386 7.02944 16 12 16C16.9706 16 21 18.2386 21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">Peer Matching</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Get matched with peers from top companies for realistic interview practice and valuable feedback.
              </p>
              <div className="mt-4 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                <CheckCircle className="mr-1 h-3 w-3" />
                Beta
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-blue-900/20 dark:to-blue-900/10"></div>
              <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <svg
                  className="h-8 w-8 text-blue-600 dark:text-blue-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12H15M12 9V15M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">Performance Analytics</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Get detailed insights on your interview performance with AI-powered analysis and improvement
                suggestions.
              </p>
              <div className="mt-4 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Sparkles className="mr-1 h-3 w-3" />
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Testimonials */}
      <section className="bg-white py-24 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              <Star className="mr-1.5 h-3.5 w-3.5" />
              Beta Feedback
            </div>
            <h2 className="font-serif text-3xl font-normal text-gray-900 dark:text-white sm:text-4xl">
              Early Access Testimonials
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
              Hear what our beta users are saying
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-purple-900/20 dark:to-purple-900/10"></div>
              <div className="relative flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                "The AI interviewer is incredibly realistic. It askedd follow-up questions that really made me think and
                helped me prepare for my actual interviews."
              </p>
              <div className="mt-8 flex items-center">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-purple-100">
                  <img src="/placeholder.svg?height=48&width=48" alt="User avatar" />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900 dark:text-white">Alex K.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Software Engineer at Meta</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-indigo-900/20 dark:to-indigo-900/10"></div>
              <div className="relative flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                "Being part of this beta has been a game-changer. The peer matching system connected me with someone who
                gave me insights I wouldn't have gotten elsewhere."
              </p>
              <div className="mt-8 flex items-center">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-indigo-100">
                  <img src="/placeholder.svg?height=48&width=48" alt="User avatar" />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900 dark:text-white">Priya M.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Product Manager at Google</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-blue-900/20 dark:to-blue-900/10"></div>
              <div className="relative flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                "After using the AI interview practice, I felt so much more confident. I landed my dream job at a top
                tech company after just 3 weeks of practice!"
              </p>
              <div className="mt-8 flex items-center">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-blue-100">
                  <img src="/placeholder.svg?height=48&width=48" alt="User avatar" />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900 dark:text-white">David L.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Frontend Developer at Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="relative overflow-hidden bg-white py-24 dark:bg-gray-950">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white to-purple-50/50 dark:from-gray-950 dark:to-purple-950/30"></div>
        <div className="absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 opacity-30 blur-3xl dark:from-purple-900/20 dark:to-indigo-900/20"></div>
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 opacity-30 blur-3xl dark:from-indigo-900/20 dark:to-blue-900/20"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(107,70,193,0.1)] dark:bg-gray-800">
              <div className="grid md:grid-cols-2">
                {/* Left side - Image/Illustration */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 p-8 text-white">
                  <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        Limited Access
                      </div>
                      <h3 className="mt-4 font-serif text-3xl font-normal">Join our private beta</h3>
                      <p className="mt-4 text-purple-100">
                        Be among the first to experience our AI-powered interview platform and shape its future.
                      </p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm text-purple-100">Early access to all features</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm text-purple-100">Direct feedback channel to our team</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm text-purple-100">Exclusive beta community access</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Call to action */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <h3 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">Request your invite</h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Join our waitlist today and be notified when it's your turn to access the beta.
                  </p>

                  <form className="mt-8 space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your role
                      </label>
                      <select
                        id="role"
                        name="role"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option>Software Engineer</option>
                        <option>Product Manager</option>
                        <option>Data Scientist</option>
                        <option>Designer</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-xl hover:shadow-purple-600/30"
                    >
                      Join Waitlist
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </form>

                  <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-purple-600 dark:text-purple-400">87% of spots filled.</span> We'll
                    notify you when it's your turn to join.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
