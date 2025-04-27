import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-white dark:bg-gray-950" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 opacity-30 blur-3xl dark:from-purple-900/20 dark:to-indigo-900/20" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-30 blur-3xl dark:from-blue-900/20 dark:to-indigo-900/20" />

        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
          <div className="text-center lg:text-left lg:w-1/2">
            <h1 className="font-serif text-5xl font-normal tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
              <span className="block">Elevate Your</span>
              <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Interview Skills
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 lg:mx-0 lg:max-w-md">
              Connect with peers, practice interviews, and grow together. Free, flexible, and focused on your success.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/schedule"
                className="relative inline-flex h-12 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 p-[1px]"
              >
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-purple-700 transition-all duration-300 ease-out hover:bg-opacity-0 hover:text-white dark:bg-gray-950 dark:text-purple-300 dark:hover:bg-opacity-0 dark:hover:text-white">
                  Schedule Interview <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
              <Link
                href="#features"
                className="relative inline-flex h-12 overflow-hidden rounded-full border border-gray-200 p-[1px] dark:border-gray-800"
              >
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-gray-700 transition-all duration-300 ease-out hover:bg-gray-50 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900">
                  Learn More
                </span>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block lg:w-1/2">
            <div className="relative ml-10 mt-10">
              <div className="absolute -left-4 -top-4 h-72 w-72 rounded-3xl bg-purple-100/50 backdrop-blur-sm dark:bg-purple-900/10"></div>
              <div className="absolute -right-4 -bottom-4 h-72 w-72 rounded-3xl bg-indigo-100/50 backdrop-blur-sm dark:bg-indigo-900/10"></div>
              <div className="relative rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(8,_112,_184,_0.05)] dark:bg-gray-800">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-purple-50 p-2 dark:bg-purple-900/20">
                    <svg
                      className="h-8 w-8 text-purple-600 dark:text-purple-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 21C3 18.2386 7.02944 16 12 16C16.9706 16 21 18.2386 21 21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Mock Interview</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today at 3:00 PM</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Technical Interview with Alex</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">60 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Focus</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">System Design</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-serif font-normal text-purple-600 dark:text-purple-400">5,000+</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-serif font-normal text-purple-600 dark:text-purple-400">10,000+</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Interviews Completed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-serif font-normal text-purple-600 dark:text-purple-400">92%</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-serif font-normal text-purple-600 dark:text-purple-400">4.8/5</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-normal text-gray-900 dark:text-white sm:text-4xl">
              Why Choose PeerPulse
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
              The perfect environment for technical interview practice
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
                    d="M12 8V12L14.5 14.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.5 12C5.5 8.41 8.41 5.5 12 5.5C15.59 5.5 18.5 8.41 18.5 12C18.5 15.59 15.59 18.5 12 18.5C8.41 18.5 5.5 15.59 5.5 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">Flexible Scheduling</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Choose from daily time slots that fit your schedule, with sessions available around the clock.
              </p>
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
                    strokeWidth="1.5"
                  />
                  <path
                    d="M3 21C3 18.2386 7.02944 16 12 16C16.9706 16 21 18.2386 21 21"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">Diverse Peer Network</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Connect with peers from different backgrounds and experience levels for varied perspectives.
              </p>
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
                    d="M8.5 11L11.5 14L16 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-normal text-gray-900 dark:text-white">Structured Feedback</h3>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Get and give actionable feedback to improve your interview skills with our guided framework.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow Section - Redesigned with premium aesthetics */}
      <section className="relative overflow-hidden bg-white py-24">
        {/* Background gradient circles */}
        <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-20 blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative">
              {/* Process Card 1 */}
              <div className="relative z-10 ml-0 md:ml-12">
                <div className="group overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-[0_15px_30px_rgba(107,70,193,0.08)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(107,70,193,0.15)] hover:translate-y-[-5px]">
                  <div className="flex items-center gap-6 p-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-purple-100 opacity-90 blur-lg"></div>
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                        <svg
                          className="h-8 w-8 text-purple-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 2V5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16 2V5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.5 9.08997H20.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-normal text-gray-900">Schedule a session</h3>
                      <p className="mt-2 text-gray-600">Choose a time that works for you from our available slots</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="my-6 hidden justify-center md:flex">
                <svg
                  className="h-12 w-12 rotate-90 text-purple-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19L19 12L12 5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Process Card 2 */}
              <div className="relative z-10 mr-0 md:mr-12">
                <div className="group overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-[0_15px_30px_rgba(107,70,193,0.08)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(107,70,193,0.15)] hover:translate-y-[-5px]">
                  <div className="flex items-center gap-6 p-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-indigo-100 opacity-90 blur-lg"></div>
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                        <svg
                          className="h-8 w-8 text-indigo-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M3 21C3 18.2386 7.02944 16 12 16C16.9706 16 21 18.2386 21 21"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-normal text-gray-900">Get matched with a peer</h3>
                      <p className="mt-2 text-gray-600">
                        We'll connect you with someone who shares your interests and goals
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="my-6 hidden justify-center md:flex">
                <svg
                  className="h-12 w-12 rotate-90 text-purple-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19L19 12L12 5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Process Card 3 */}
              <div className="relative z-10 ml-0 md:ml-12">
                <div className="group overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-[0_15px_30px_rgba(107,70,193,0.08)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(107,70,193,0.15)] hover:translate-y-[-5px]">
                  <div className="flex items-center gap-6 p-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-blue-100 opacity-90 blur-lg"></div>
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                        <svg
                          className="h-8 w-8 text-blue-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9.1 12V10.5C9.1 8.5 10.6 7.6 12.4 8.7L13.7 9.4L15 10.1C16.8 11.2 16.8 13 15 14.1L13.7 14.8L12.4 15.5C10.6 16.6 9.1 15.7 9.1 13.7V12Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-normal text-gray-900">Practice together</h3>
                      <p className="mt-2 text-gray-600">
                        Take turns interviewing each other in our virtual interview room
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow 3 */}
              <div className="my-6 hidden justify-center md:flex">
                <svg
                  className="h-12 w-12 rotate-90 text-purple-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19L19 12L12 5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Process Card 4 */}
              <div className="relative z-10 mr-0 md:mr-12">
                <div className="group overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 shadow-[0_15px_30px_rgba(107,70,193,0.08)] transition-all duration-500 hover:shadow-[0_20px_40px_rgba(107,70,193,0.15)] hover:translate-y-[-5px]">
                  <div className="flex items-center gap-6 p-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 rounded-full bg-green-100 opacity-90 blur-lg"></div>
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                        <svg
                          className="h-8 w-8 text-green-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.5 11L11.5 14L16 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-normal text-gray-900">Grow your skills</h3>
                      <p className="mt-2 text-gray-600">Exchange feedback and improve with each session</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connecting Line */}
              <div className="absolute left-8 top-8 bottom-8 hidden w-0.5 bg-gradient-to-b from-purple-300 via-indigo-300 to-blue-300 md:block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-normal text-gray-900 dark:text-white sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
              Success stories from our community
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-purple-900/20 dark:to-purple-900/10"></div>
              <div className="relative flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 17.75L5.82802 20.995L7.00702 14.122L2.00702 9.25495L8.90702 8.25495L11.993 2.00195L15.079 8.25495L21.979 9.25495L16.979 14.122L18.158 20.995L12 17.75Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ))}
              </div>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                "After just 5 mock interviews, I felt so much more confident. I landed my dream job at Google!"
              </p>
              <div className="mt-8 flex items-center">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-purple-100">
                  <img src="/placeholder.svg?height=48&width=48" alt="User avatar" />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900 dark:text-white">Sarah K.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-indigo-900/20 dark:to-indigo-900/10"></div>
              <div className="relative flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 17.75L5.82802 20.995L7.00702 14.122L2.00702 9.25495L8.90702 8.25495L11.993 2.00195L15.079 8.25495L21.979 9.25495L16.979 14.122L18.158 20.995L12 17.75Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ))}
              </div>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                "The feedback I received helped me identify my weak points. Incredibly valuable experience."
              </p>
              <div className="mt-8 flex items-center">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-indigo-100">
                  <img src="/placeholder.svg?height=48&width=48" alt="User avatar" />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900 dark:text-white">Michael T.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Frontend Developer</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-gray-800 dark:to-gray-900">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-70 blur-3xl transition-all duration-300 group-hover:opacity-100 dark:from-blue-900/20 dark:to-blue-900/10"></div>
              <div className="relative flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 17.75L5.82802 20.995L7.00702 14.122L2.00702 9.25495L8.90702 8.25495L11.993 2.00195L15.079 8.25495L21.979 9.25495L16.979 14.122L18.158 20.995L12 17.75Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ))}
              </div>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
                "Being on both sides of the interview table gave me incredible insights. Highly recommend!"
              </p>
              <div className="mt-8 flex items-center">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-blue-100">
                  <img src="/placeholder.svg?height=48&width=48" alt="User avatar" />
                </div>
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900 dark:text-white">Jessica L.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data Scientist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned CTA Section */}
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
                      <h3 className="font-serif text-3xl font-normal">Ready to level up?</h3>
                      <p className="mt-4 text-purple-100">
                        Join thousands of professionals who are improving their interview skills with PeerPulse.
                      </p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                          <svg
                            className="h-4 w-4 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 12L10 17L19 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-purple-100">Personalized matching with peers</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                          <svg
                            className="h-4 w-4 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 12L10 17L19 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-purple-100">Structured feedback framework</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                          <svg
                            className="h-4 w-4 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 12L10 17L19 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-purple-100">Flexible scheduling options</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Call to action */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <h3 className="font-serif text-2xl font-normal text-gray-900 dark:text-white">
                    Schedule your first interview
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Get started today and take the first step toward interview success.
                  </p>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Link
                      href="/schedule"
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-xl hover:shadow-purple-600/30"
                    >
                      Schedule Now
                      <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M5 12H19M19 12L12 5M19 12L12 19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="#features"
                      className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Learn More
                    </Link>
                  </div>

                  <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                    No credit card required. Start with a free account and upgrade anytime.
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
