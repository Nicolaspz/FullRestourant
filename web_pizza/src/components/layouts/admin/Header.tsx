"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, CalendarDays, ChevronDown, LogOut, Menu } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-swicther"
import { useContext } from "react"
import { AuthContext } from "@/contexts/AuthContext"




export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { signOut,user } = useContext(AuthContext);
   const handleLogout = () => {
    signOut()
}
 
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-b border-[var(--sidebar-border)]">
      {/* Esquerda: Menu e Título */}
      <div className="flex items-center gap-4 min-w-[150px]">
        <button onClick={toggleSidebar} className="lg:hidden">
          <Menu className="w-6 h-6 text-[var(--sidebar-foreground)] cursor-pointer" />
        </button>
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Payment Updates</p>
        </div>
      </div>
      {/* <span>{user?.tenant_id}</span> */}
      
      {/* Direita: Ícones e Menu do Usuário */}
      <div className="flex items-center gap-4 min-w-[150px] justify-end">
        <ThemeSwitcher />
        <Bell className="w-5 h-5 cursor-pointer text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)]" />
        
        {/* Avatar com Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 flex items-center gap-1">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="User"
                  className="rounded-full object-cover"
                />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[var(--popover)] text-[var(--popover-foreground)] border border-[var(--border)]">
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span> {user?.name} </span> <br />
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
