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
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  Carrot,
  Warehouse,
  Settings,
  CreditCard,
  CookingPot,
  Martini,
  Bell,
  Mail,
  PlusSquare,
  UserCircle,
  Table2,
  Archive,
  ChevronDown,
  ChevronRight,
  Utensils,
  Home,
  ShoppingCart,
  ChefHat,
  GlassWater,
  Calculator,
  ClipboardList,
  DollarSign,
  UserCog
} from "lucide-react"

// Estrutura hierárquica do menu
type MenuItem = {
  icon: any;
  label: string;
  href?: string;
  roles: UserRole[];
  subItems?: {
    label: string;
    href: string;
    icon?: any;
    roles: UserRole[];
  }[];
}

const menuStructure: MenuItem[] = [
  { 
    icon: Home, 
    label: "Dashboard", 
    href: "/dashboard",
    roles: ['Super Admin', 'Admin', 'Garçon', 'Caixa']
  },
  
  // Gestão do Restaurante
  {
    icon: Utensils,
    label: "Restaurante",
    roles: ['Super Admin', 'Admin', 'Garçon', 'Caixa'],
    subItems: [
      {
        label: "Mesas",
        href: "/dashboard/mesa",
        icon: Table2,
        roles: ['Super Admin', 'Admin', 'Caixa']
      },
      {
        label: "Cardápio",
        href: "/dashboard/cardapio",
        icon: ClipboardList,
        roles: ['Super Admin', 'Admin', 'Caixa']
      },
      {
        label: "Cozinha",
        href: "/dashboard/cozinha",
        icon: ChefHat,
        roles: ['Super Admin', 'Admin', 'Garçon']
      },
      {
        label: "Bar",
        href: "/dashboard/bar",
        icon: GlassWater,
        roles: ['Super Admin', 'Admin', 'Garçon']
      }
    ]
  },

  // Gestão de Produtos
  {
    icon: Package,
    label: "Produtos",
    roles: ['Super Admin', 'Admin'],
    subItems: [
      {
        label: "Pedidos",
        href: "/dashboard/pedidos",
        icon: Package,
        roles: ['Super Admin', 'Admin']
      },
      {
        label: "Produtos/Pratos",
        href: "/dashboard/products",
        icon: Package,
        roles: ['Super Admin', 'Admin']
      },
      {
        label: "Ingredientes",
        href: "/dashboard/igredient",
        icon: Carrot,
        roles: ['Super Admin', 'Admin']
      },
      {
        label: "Stock",
        href: "/dashboard/stock",
        icon: Warehouse,
        roles: ['Super Admin', 'Admin']
      },
      {
        label: "Economato",
        href: "/dashboard/economato",
        icon: Archive,
        roles: ['Super Admin', 'Admin']
      }
    ]
  },

  // Gestão Financeira
  {
    icon: DollarSign,
    label: "Financeiro",
    roles: ['Super Admin', 'Admin', 'Caixa'],
    subItems: [
      {
        label: "Caixa",
        href: "/dashboard/caixa",
        icon: Calculator,
        roles: ['Super Admin', 'Admin', 'Caixa']
      },
      {
        label: "Compras",
        href: "/dashboard/compra",
        icon: ShoppingCart,
        roles: ['Super Admin', 'Admin']
      }
    ]
  },

  // Administração
  {
    icon: UserCog,
    label: "Administração",
    roles: ['Super Admin', 'Admin'],
    subItems: [
      {
        label: "Usuários",
        href: "/dashboard/users",
        icon: Users,
        roles: ['Super Admin','Admin']
      },
      {
        label: "Definições",
        href: "/dashboard/settings",
        icon: Settings,
        roles: ['Super Admin', 'Admin']
      }
    ]
  }
]

// Footer icons
const footerIcons = [Bell, Mail, UserCircle, PlusSquare]

export default function Sidebar({ closeSidebar }: { closeSidebar?: () => void }) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([])

  useEffect(() => {
    // Pegar a role do cookie
    const { '@servFixe.role': role } = parseCookies()
    if (role) {
      setUserRole(role as UserRole)
      
      // Filtrar menu baseado na role
      const filtered = menuStructure.filter(item => 
        item.roles.includes(role as UserRole)
      ).map(item => {
        // Filtrar subItems se existirem
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter(subItem => 
            subItem.roles.includes(role as UserRole)
          )
          return { ...item, subItems: filteredSubItems }
        }
        return item
      })
      setFilteredMenu(filtered)
      
      // Abrir menus que contenham o path atual
      const initialOpenState: Record<string, boolean> = {}
      filtered.forEach(item => {
        if (item.subItems && item.subItems.length > 0) {
          const hasActiveChild = item.subItems.some(subItem => 
            pathname === subItem.href || pathname?.startsWith(subItem.href + '/')
          )
          initialOpenState[item.label] = hasActiveChild
        }
      })
      setOpenMenus(initialOpenState)
    }
  }, [pathname])

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

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
    <aside className="h-screen w-64 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col justify-between py-6 border-r border-[var(--sidebar-border)] overflow-y-auto">
      {/* Fechar em mobile */}
      {closeSidebar && (
        <div className="flex justify-end px-4 cursor-pointer mb-4">
          <button onClick={closeSidebar} className="text-[var(--sidebar-foreground)] text-xl hover:opacity-70 transition-opacity">×</button>
        </div>
      )}

      {/* Top section */}
      <div>
        <div className="flex flex-col items-center gap-2 mb-8 px-4">
          <div className="w-14 h-14 rounded-full bg-[var(--sidebar-foreground)] text-[var(--sidebar)] flex items-center justify-center font-bold text-2xl overflow-hidden">
            <Image 
              src={logoImg} 
              alt="ServeFixe" 
              width={60}
              height={60}
              priority
              className="object-contain"
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

        {/* Menu hierárquico */}
        <nav className="space-y-1 px-4">
          {filteredMenu.map((item) => {
            const isActive = pathname === item.href
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isMenuOpen = openMenus[item.label]

            // Se for um item sem submenus (como Dashboard)
            if (!hasSubItems && item.href) {
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start gap-3 text-[var(--muted-foreground)] hover:text-[var(--sidebar-accent-foreground)] hover:bg-[var(--sidebar-accent)] transition-all duration-200",
                    isActive && "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Link>
                </Button>
              )
            }

            // Se for um item com submenus
            if (hasSubItems) {
              // Verificar se algum subitem está ativo
              const hasActiveSubItem = item.subItems!.some(subItem => 
                pathname === subItem.href || pathname?.startsWith(subItem.href + '/')
              )

              return (
                <div key={item.label} className="space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between gap-3 text-[var(--muted-foreground)] hover:text-[var(--sidebar-accent-foreground)] hover:bg-[var(--sidebar-accent)] transition-all duration-200",
                      (isMenuOpen || hasActiveSubItem) && "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                    )}
                    onClick={() => toggleMenu(item.label)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </div>
                    {isMenuOpen ? (
                      <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                    )}
                  </Button>

                  {/* Subitems com transição suave */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-8 space-y-1">
                      {item.subItems!.map((subItem) => {
                        const isSubActive = pathname === subItem.href
                        const SubIcon = subItem.icon || item.icon

                        return (
                          <Button
                            key={subItem.href}
                            variant="ghost"
                            asChild
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-3 text-[var(--muted-foreground)] hover:text-[var(--sidebar-accent-foreground)] hover:bg-[var(--sidebar-accent)] transition-all duration-200",
                              isSubActive && "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                            )}
                          >
                            <Link href={subItem.href}>
                              <SubIcon className="w-4 h-4" />
                              <span className="text-sm">{subItem.label}</span>
                            </Link>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            }

            return null
          })}
        </nav>
      </div>

      {/* Footer icons */}
      <div className="flex items-center justify-evenly border-t border-[var(--sidebar-border)] pt-4 px-4 mt-4">
        {footerIcons.map((Icon, i) => (
          <Button
            key={i}
            variant="ghost"
            size="icon"
            className="text-[var(--muted-foreground)] hover:text-[var(--sidebar-accent-foreground)] hover:bg-[var(--sidebar-accent)] transition-all duration-200"
          >
            <Icon className="w-5 h-5" />
          </Button>
        ))}
      </div>
    </aside>
  )
}