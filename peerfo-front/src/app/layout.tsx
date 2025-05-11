import type React from "react"
import ClientLayout from "./clientLayout"

export const metadata = {
  title: "peerfo - Mock Interview Platform",
  description: "Schedule peer mock interviews to improve your technical interview skills",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
