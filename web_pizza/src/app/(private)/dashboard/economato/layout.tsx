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
import { useContext, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Organization } from "@/types/product";
import StockPage from "./stock/page";
import PedidosPage from "./pedidos/page";
import ConsumoPage from "./consumo/page";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsTabs } from "@/components/settings/SettingsTabs";


export default function EconomatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const { user } = useContext(AuthContext)
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [isLoading, setIsLoading] = useState(true)

  const tabs = [
         { 
      id: "Stock", 
      label: "Stock/Inventário", 
      icon: "warehouse", // ← string, não componente
      content: <StockPage /> 
    },
    { 
      id: "Pedidos", 
      label: "Pedidos", 
      icon: "arrow-right-left", // ← string
      content: <PedidosPage /> 
    },
    
    { 
      id: "Consumos", 
      label: "Consumos Internos", 
      icon: "clipboard-list", // ← string
      content: <ConsumoPage /> 
    },
  
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
              <SettingsHeader 
                title="Configurações do Stock "
                description="Gerencie Os stock, fazendo Pedidos e Consumos"
              />
              
              <SettingsTabs tabs={tabs} defaultTab="Stock" />
            </div>
  );
}