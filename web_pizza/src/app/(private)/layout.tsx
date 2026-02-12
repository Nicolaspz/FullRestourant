"use client"

import { useState } from "react"
import Sidebar from "@/components/layouts/admin/Sidebar"
import Header from "@/components/layouts/admin/Header"
import { SocketProvider } from "@/contexts/SocketContext"

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--sidebar)]">
        {/* Sidebar Desktop */}
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        {/* Sidebar Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className="relative z-50">
              <Sidebar closeSidebar={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}


        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SocketProvider>
  )
}
