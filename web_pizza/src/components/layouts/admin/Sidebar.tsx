
import Image from 'next/image';
import logoImg from '../../../../public/Logo.png'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { parseCookies } from "nookies"

// Definir os tipos de roles
type UserRole = 'Super Admin' | 'Admin' | 'Garçon' | 'Caixa'

import {
  LayoutDashboard,  // Dashboard
  Users,            // Usuários
  Package,          // Produtos
  Receipt,          // Compras/Faturas
  Carrot,           // Ingredientes
  Warehouse,        // Stock
  Settings,         // Definições
  CreditCard,       // Caixa
  CookingPot,       // Cozinha
  Martini,          // Bar
  Bell,             // Notificações
  Mail,             // Mensagens
  PlusSquare,       // Adicionar
  UserCircle,        // Perfil
  Table,
  Table2,
  Archive
} from "lucide-react"

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    href: "/dashboard",
    roles: ['Super Admin', 'Admin', 'Garçon', 'Caixa'] as UserRole[]
  },
  { 
    icon: Table2, 
    label: "Menú", 
    href: "/dashboard/cardapio",
    roles: ['Super Admin', 'Admin', 'Caixa'] as UserRole[]
  },
  { 
    icon: Users, 
    label: "Usuários", 
    href: "/dashboard/users",
    roles: ['Super Admin'] as UserRole[]
  },
  { 
    icon: Package, 
    label: "Produtos", 
    href: "/dashboard/products",
    roles: ['Super Admin', 'Admin'] as UserRole[]
  },
  { 
    icon: Receipt, 
    label: "Compras", 
    href: "/dashboard/compra",
    roles: ['Super Admin', 'Admin'] as UserRole[]
  },
  { 
    icon: Carrot, 
    label: "Ingredientes", 
    href: "/dashboard/igredient",
    roles: ['Super Admin', 'Admin'] as UserRole[]
  },
  { 
    icon: Warehouse, 
    label: "Stock", 
    href: "/dashboard/stock",
    roles: ['Super Admin', 'Admin'] as UserRole[]
  },
  
  { 
    icon: CreditCard, 
    label: "Caixa", 
    href: "/dashboard/caixa",
    roles: ['Super Admin', 'Admin', 'Caixa'] as UserRole[]
  },
  { 
    icon: CookingPot, 
    label: "Cozinha", 
    href: "/dashboard/cozinha",
    roles: ['Super Admin', 'Admin', 'Garçon'] as UserRole[]
  },
  { 
    icon: Martini, 
    label: "Bar", 
    href: "/dashboard/bar",
    roles: ['Super Admin', 'Admin', 'Garçon'] as UserRole[]
  },
  { 
    icon: Table2, 
    label: "Mesas", 
    href: "/dashboard/mesa",
    roles: ['Super Admin', 'Admin', 'Caixa'] as UserRole[]
  },
  { 
    icon: Table2, 
    label: "Menú", 
    href: "/dashboard/cardapio",
    roles: ['Super Admin', 'Admin', 'Caixa'] as UserRole[]
  },
  { 
    icon: Archive, 
    label: "Economato", 
    href: "/dashboard/economato",
    roles: ['Super Admin', 'Admin'] as UserRole[]
  },
  { 
    icon: Settings, 
    label: "Definições", 
    href: "/dashboard/settings",
    roles: ['Super Admin', 'Admin'] as UserRole[]
  },
]

// Footer icons mais relevantes
const footerIcons = [Bell, Mail, UserCircle, PlusSquare]

export default function Sidebar({ closeSidebar }: { closeSidebar?: () => void }) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems)

  useEffect(() => {
    // Pegar a role do cookie
    const { '@servFixe.role': role } = parseCookies()
    if (role) {
      setUserRole(role as UserRole)
      
      // Filtrar menu items baseado na role
      const filtered = menuItems.filter(item => 
        item.roles.includes(role as UserRole)
      )
      setFilteredMenuItems(filtered)
    }
  }, [])

  // Se não tem role ainda, mostra menu vazio ou loading
  if (!userRole) {
    return (
      <aside className="h-screen w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col justify-between py-6 border-r border-[var(--sidebar-border)]">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sidebar-foreground)]"></div>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Carregando...</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="h-screen w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col justify-between py-6 border-r border-[var(--sidebar-border)]">
      {/* Fechar em mobile */}
      {closeSidebar && (
        <div className="flex justify-end px-4 cursor-pointer">
          <button onClick={closeSidebar} className="text-[var(--sidebar-foreground)] text-xl">×</button>
        </div>
      )}

      {/* Top section */}
      <div>
        <div className="flex flex-col items-center gap-2 mb-10">
          <div className="w-14 h-14 rounded-full bg-[var(--sidebar-foreground)] text-[var(--sidebar)] flex items-center justify-center font-bold text-2xl">
            <Image 
              src={logoImg} 
              alt="ServeFixe" 
              width={60}
              height={60}
              priority
            />
          </div>
          <h2 className="text-xl font-semibold">
            ServeFixe
          </h2>
          {/* Mostrar role do usuário */}
          <div className="px-3 py-1 bg-[var(--sidebar-accent)] rounded-full">
            <span className="text-xs font-medium text-[var(--sidebar-accent-foreground)]">
              {userRole}
            </span>
          </div>
        </div>

        {/* Menu filtrado por role */}
        <nav className="space-y-2 px-6">
          {filteredMenuItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href

            return (
              <Button
                key={label}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start gap-3 text-[var(--muted-foreground)] hover:text-[var(--sidebar-accent-foreground)] hover:bg-[var(--sidebar-accent)]",
                  isActive && "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                )}
              >
                <Link href={href}>
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Footer icons */}
      <div className="flex items-center justify-evenly border-t border-[var(--sidebar-border)] pt-4 px-4">
        {footerIcons.map((Icon, i) => (
          <Button
            key={i}
            variant="ghost"
            size="icon"
            className="text-[var(--muted-foreground)] hover:text-[var(--sidebar-accent-foreground)]"
          >
            <Icon className="w-5 h-5" />
          </Button>
        ))}
      </div>
    </aside>
  )
}