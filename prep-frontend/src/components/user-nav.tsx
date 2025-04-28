"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Settings, Calendar, LogOut, ChevronRight } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function UserNav() {
  // Mock authentication state - in a real app, this would come from your auth provider
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Toggle auth state for demo purposes
  const toggleAuth = () => setIsAuthenticated(!isAuthenticated)

  if (!isAuthenticated) {
    return (
      <>
        <Link
          href="#"
          onClick={toggleAuth} // For demo purposes only
          className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-purple-600 hover:text-purple-600"
        >
          Sign In
        </Link>
        <Link
          href="#"
          className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:shadow-lg"
        >
          Sign Up
        </Link>
      </>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback className="bg-purple-100 text-purple-600">JP</AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px]">
        <SheetHeader className="pb-6">
          <SheetTitle className="font-serif text-2xl">Your Account</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-4 border-b pb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg?height=64&width=64" alt="User" />
            <AvatarFallback className="text-lg bg-purple-100 text-purple-600">JP</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-medium">Jane Pearson</p>
            <p className="text-sm text-gray-500">jane.pearson@example.com</p>
          </div>
        </div>

        <div className="mt-6 space-y-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Interviews</h3>
          <Link
            href="/schedule"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Schedule Interview</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href="/past-interviews"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Past Interviews</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>

        <div className="mt-6 space-y-1">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Account</h3>
          <Link
            href="/settings"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-purple-600" />
              <span>Settings</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href="/profile"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-purple-600" />
              <span>Profile</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={toggleAuth} // For demo purposes only
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
