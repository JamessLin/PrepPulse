"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { LogOut, Settings, User as UserIcon } from "lucide-react";

import { authService } from "@/services/authService";
import { userService } from "@/services/useService";   // ← NEW

interface MinimalUser {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export function UserNav() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<MinimalUser | null>(null);

  /* ──────────────────────────────────────────────────────────
     Pull first / last name from our `/users/profile` endpoint
  ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const loggedIn = authService.isAuthenticated();
    setIsAuthenticated(loggedIn);

    if (!loggedIn) return;

    const currentAuth = authService.getCurrentUser(); // { email, id, … }

    userService
      .getProfile()
      .then((profile) => {
        setUser({
          email: currentAuth?.email ?? undefined,
          first_name: profile.first_name,
          last_name: profile.last_name,
        });
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        // fall back to whatever info we already have
        setUser({ email: currentAuth?.email });
      });
  }, []);

  /* ────────────────────────────────────────────────────────── */

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push("/"); // or /auth
  };

  // Not logged in → show CTA
  if (!isAuthenticated) {
    return (
      <Link
        href="/auth"
        className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:shadow-lg"
      >
        Sign Up
      </Link>
    );
  }

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 focus-visible:ring-0"
        >
          <Avatar className="h-8 w-8 ring-2 ring-purple-100">
            {/* Replace with real avatar_url if you store one */}
            <AvatarImage
              src="/placeholder.svg?height=32&width=32"
              alt={`${user?.first_name ?? ""} avatar`}
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 overflow-hidden rounded-xl p-0"
        align="end"
      >
        {/* Top card with the user’s name / e‑mail */}
        <div className="border-b border-gray-100 bg-white px-4 py-3">
          <p className="font-medium text-gray-900">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>

        <DropdownMenuItem
          asChild
          className="flex cursor-pointer items-center gap-2 py-2.5 pl-4"
        >
          <Link href="/profile">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="flex cursor-pointer items-center gap-2 py-2.5 pl-4"
        >
          <Link href="/settings">
            <Settings className="h-4 w-4 text-gray-500" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 py-2.5 pl-4 text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
