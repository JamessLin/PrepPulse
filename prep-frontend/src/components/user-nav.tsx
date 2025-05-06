"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Settings, Calendar, LogOut, ChevronRight, Clock, CheckCircle, Bell, CreditCard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/authService" // Adjust the path based on your project structure
import { profileService } from "@/services/profileService"



export function UserNav() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ first_name?: string, last_name?: string, email?: string } | null>(null)

  useEffect(() => {
    const loggedIn = authService.isAuthenticated();
    setIsAuthenticated(loggedIn);
  
    if (loggedIn) {
      const currentUser = authService.getCurrentUser(); // contains email
      profileService
        .getProfile()
        .then((profile) => {
          // Merge profile info with auth info
          setUser({
            email: currentUser?.email || null,
            first_name: profile.first_name,
            last_name: profile.last_name,
          });
        })
        .catch((err) => {
          console.error("Failed to load profile:", err);
          // fallback to auth data only
          setUser({ email: currentUser?.email || null });
        });
    }
  }, []);
  

  const handleLogout = async () => {
    await authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    router.push("/") // or to /auth
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth"
        className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:shadow-lg"
      >
        Sign Up
      </Link>
    )
  }
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 ring-2 ring-purple-100">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <Avatar className="h-8 w-8 ring-2 ring-purple-100">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>


          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 overflow-hidden rounded-xl p-0" align="end">
        {/* User info section with white background */}
        <div className="border-b border-gray-100 bg-white px-4 py-3">
          <p className="font-medium text-gray-900">
            {user?.first_name || ''} {user?.last_name || ''}
          </p>
          <p className="text-xs text-gray-500">{user?.email || ''}</p>
        </div>


        <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 py-2.5 pl-4">
          <Link href="/profile">
            <User className="h-4 w-4 text-gray-500" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="flex cursor-pointer items-center gap-2 py-2.5 pl-4">
          <Link href="/settings">
            <Settings className="h-4 w-4 text-gray-500" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 py-2.5 pl-4 text-red-600 focus:bg-red-50 focus:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
