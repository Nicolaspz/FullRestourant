// components/settings/SettingsTabs.tsx (atualizado)
"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, CreditCard, Building2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface Tab {
  id: string
  label: string
  icon: string
  content: React.ReactNode
}

interface SettingsTabsProps {
  tabs: Tab[]
  defaultTab: string
}

const iconMap = {
  user: <User className="mr-2 h-4 w-4" />,
  lock: <Lock className="mr-2 h-4 w-4" />,
  bell: <Bell className="mr-2 h-4 w-4" />,
  "credit-card": <CreditCard className="mr-2 h-4 w-4" />,
  building: <Building2 className="mr-2 h-4 w-4" />,
}

export function SettingsTabs({ tabs, defaultTab }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab")
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [activeTab])

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-5">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="cursor-pointer">
            {iconMap[tab.icon as keyof typeof iconMap]}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando {tab.label}...</span>
            </div>
          ) : (
            tab.content
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}