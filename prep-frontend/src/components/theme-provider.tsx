"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  attribute?: string
}

const ThemeProviderContext = createContext<{ theme: Theme }>({
  theme: "light",
})

export function ThemeProvider({ children, defaultTheme = "light", attribute = "class" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    // Remove "dark" class if it exists
    root.classList.remove("dark")

    // Always add "light" class
    if (attribute === "class") {
      root.classList.add("light")
    } else {
      root.setAttribute(attribute, "light")
    }
  }, [attribute])

  const value = {
    theme: "light" as Theme,
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return {
    theme: "light" as Theme,
    setTheme: () => {}, // No-op function since we're not allowing theme changes
  }
}
