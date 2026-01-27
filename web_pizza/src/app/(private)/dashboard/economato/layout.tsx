'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Warehouse, 
  Map, 
  ArrowRightLeft, 
  ClipboardList 
} from "lucide-react";

export default function EconomatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { 
      label: "Stock / Inventário", 
      href: "/dashboard/economato/stock",
      icon: Warehouse
    },
    { 
      label: "Áreas", 
      href: "/dashboard/economato/areas",
      icon: Map
    },
    { 
      label: "Pedidos / Transferências", 
      href: "/dashboard/economato/pedidos",
      icon: ArrowRightLeft
    },
    { 
      label: "Consumo Interno", 
      href: "/dashboard/economato/consumo",
      icon: ClipboardList
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background px-6 py-2">
        <nav className="flex items-center space-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 py-3 text-sm font-medium transition-colors border-b-2 hover:text-primary whitespace-nowrap",
                  isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
