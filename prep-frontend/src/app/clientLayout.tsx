"use client"

import type React from "react"
import "./globals.css"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Link from "next/link"
import { UserNav } from "@/components/user-nav"
import { usePathname } from "next/navigation"
// Update the imports to include useState for the mobile menu
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Menu } from "lucide-react"
import { AuthProvider } from "@/context/authContext"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  // In the RootLayout component, add a state for the mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Check if page is scrolled more than 100px
      setScrolled(window.scrollY > 100)
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} light`}>
      <body className="font-sans bg-white">
        <ThemeProvider>
          <AuthProvider>
            {/* Replace the entire header section with this updated version */}
            {!pathname.startsWith("/auth") && (
              <motion.header
                key={`navbar-${pathname}`}
                className="fixed left-0 right-0 z-50 navbar-container page-transition-fix"
                initial={false}
                animate={{
                  top: scrolled ? 16 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <motion.div
                  className="mx-auto flex items-center justify-between"
                  initial={false}
                  animate={{
                    maxWidth: scrolled ? "64rem" : "80rem", // 5xl vs 7xl
                    height: scrolled ? "3.5rem" : "5rem", // h-14 vs h-20
                    padding: scrolled ? "0 1.5rem" : "0 1rem",
                    borderRadius: scrolled ? "9999px" : "0px",
                    backgroundColor: scrolled ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0)",
                    borderWidth: scrolled ? "1px" : "0px",
                    borderColor: scrolled ? "rgba(229, 231, 235, 1)" : "transparent",
                    boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    backgroundColor: { duration: 0.2 },
                    borderColor: { duration: 0.2 },
                  }}
                >
                  {/* Left side - Logo */}
                  <div className="flex justify-start">
                    <Link href="/" className="font-serif text-xl text-gray-900 transition-colors duration-300">
                      peer<span className="text-purple-600">fo</span>
                    </Link>
                  </div>

                  {/* Middle - Navigation (desktop only) */}
                  <nav className="flex-1 hidden justify-center md:flex">
                    <div className="space-x-8">
                      <NavLink href="/" scrolled={scrolled}>
                        Home
                      </NavLink>
                      <NavLink href="/schedule" scrolled={scrolled}>
                        Schedule
                      </NavLink>
                      <NavLink href="#" scrolled={scrolled}>
                        Resources
                      </NavLink>
                      <NavLink href="#" scrolled={scrolled}>
                        FAQ
                      </NavLink>
                    </div>
                  </nav>

                  {/* Right side - User navigation (desktop) / Mobile menu button (mobile) */}
                  <div className="flex justify-end items-center">
                    <div className="hidden md:block">
                      <UserNav />
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="md:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
                      aria-label="Toggle mobile menu"
                    >
                      <Menu size={24} />
                    </button>
                  </div>
                </motion.div>

                {/* Mobile menu dropdown */}
                <AnimatePresence>
                  {mobileMenuOpen && (
                    <motion.div
                      className="absolute top-full left-4 right-4 mt-2 bg-white rounded-lg shadow-lg overflow-hidden md:hidden mobile-menu"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-2 px-4 space-y-1">
                        <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>
                          Home
                        </MobileNavLink>
                        <MobileNavLink href="/schedule" onClick={() => setMobileMenuOpen(false)}>
                          Schedule
                        </MobileNavLink>
                        <MobileNavLink href="#" onClick={() => setMobileMenuOpen(false)}>
                          Resources
                        </MobileNavLink>
                        <MobileNavLink href="#" onClick={() => setMobileMenuOpen(false)}>
                          FAQ
                        </MobileNavLink>
                      </div>
                      <div className="border-t border-gray-100 py-3 px-4 flex flex-col space-y-2">
                        <Link
                          href="/auth"
                          className="block w-full py-2 text-center text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/auth"
                          className="block w-full py-2 text-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.header>
            )}
            <main className={!pathname.startsWith("/auth") ? "" : ""}>{children}</main>
            {!pathname.startsWith("/auth") && (
              <footer className="border-t bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center space-x-6 md:order-2">
                      <Link href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </Link>
                      <Link href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">GitHub</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                      <Link href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                    <div className="mt-8 md:order-1 md:mt-0">
                      <p className="text-center text-base text-gray-400">
                        &copy; {new Date().getFullYear()} peerfo. All rights reserved.
                      </p>
                    </div>
                  </div>
                </div>
              </footer>
            )}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                style: {
                  border: "1px solid #e2e8f0",
                  padding: "16px",
                  borderRadius: "0.5rem",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

// Replace the NavLink component at the bottom of the file with this:
function NavLink({ href, scrolled, children }: { href: string; scrolled: boolean; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "relative text-sm font-medium transition-colors duration-300 px-3 py-2 rounded-full",
        isActive ? "text-purple-600" : "text-gray-700 hover:text-purple-600",
      )}
    >
      {isActive && (
        <motion.span
          layoutId="navbar-active-pill"
          className="absolute inset-0 bg-purple-50 rounded-full -z-10"
          animate={{
            opacity: scrolled ? 1 : 0.7,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            opacity: { duration: 0.2 },
          }}
        />
      )}
      {children}
    </Link>
  )
}

// Add the MobileNavLink component at the bottom of the file after the NavLink component
function MobileNavLink({ href, onClick, children }: { href: string; onClick?: () => void; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "block py-2 px-3 text-sm font-medium rounded-md transition-colors",
        isActive ? "text-purple-600 bg-purple-50" : "text-gray-700 hover:text-purple-600 hover:bg-gray-50",
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
