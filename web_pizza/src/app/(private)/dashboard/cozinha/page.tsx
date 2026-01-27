'use client'
import React, { useEffect, useState, useContext } from "react";
import { setupAPIClient } from "@/services/api"; 
import { AuthContext } from "@/contexts/AuthContext"; 
import { toast } from "react-toastify";
import { FaEye, FaCheck, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import Head from "next/head";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  id: string;
  amount: number;
  prepared: boolean;
  Product: {
    id: string;
    name: string;
    categoryId: string;
    Category?: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  name: string;
  created_at: string;
  Session: {
    mesa: {
      number: number;
      Category: {
        name: string;
      };
    };
  };
  items: OrderItem[];
}

export default function KitchenPage() {
  const { user } = useContext(AuthContext);
  const apiClient = setupAPIClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  const CATEGORY_FILTER = "Comida";

  const fetchOrders = async () => {
    if (!user?.organizationId || !user?.token) return;
    setLoading(true);
    try {
      const response = await apiClient.get("/orders", {
        params: { organizationId: user.organizationId },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      const allOrders: Order[] = response.data;

      console.log("pedidos",allOrders)
      // Filtro local por categoria
      const filtered = allOrders
        .map((order) => {
          const filteredItems = order.items.filter(
            (item) => item.Product?.Category?.name === CATEGORY_FILTER
            
          );
          
          return filteredItems.length > 0
            ? { ...order, items: filteredItems }
            : null;
        })
        .filter(Boolean) as Order[];

      setOrders(allOrders);
      setFilteredOrders(filtered);
    } catch (error) {
      toast.error("Erro ao buscar pedidos");
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleCloseOrder = async (order_id: string) => {
    try {
      await apiClient.put(
        "/order/finish",
        { order_id },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast.success("Pedido finalizado com sucesso");
      fetchOrders();
    } catch (error: any) {
      const message =
        error?.response?.data?.error || "Erro ao fechar pedido.";
      toast.error(message);
    }
  };

  const togglePrepared = async (itemId: string, prepared: boolean) => {
    try {
      await apiClient.put(
        `/items/${itemId}/toggle-prepared`,
        { prepared },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      fetchOrders();
    } catch (err) {
      toast.error("Erro ao atualizar item");
    }
  };

  const isAllPrepared = (order: Order) => {
    const fullOrder = orders.find((o) => o.id === order.id);
    if (!fullOrder) return false;
    return fullOrder.items.every((item) => item.prepared);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes === 1) return "1 min atrás";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hora atrás";
    if (diffInHours < 24) return `${diffInHours} horas atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dias atrás`;
  };

  // Simula o loading do usuário
  useEffect(() => {
    if (user) {
      setUserLoading(false);
    }
  }, [user]);

  // Busca pedidos quando o usuário estiver disponível
  useEffect(() => {
    if (user?.organizationId) {
      fetchOrders();
    }
  }, [user]);

  if (userLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">A carregar dados do utilizador...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>ServeFixe - Cozinha</title>
      </Head>

      <div className="min-h-screen bg-background dark:bg-gray-900 p-4">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cozinha</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os pedidos da Cozinha em tempo real
            </p>
          </div>

          {/* Orders Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-muted-foreground text-center">
                  <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
                  <p>Não há pedidos de {CATEGORY_FILTER} no momento.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className={`transition-all duration-200 ${
                    isAllPrepared(order) 
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20" 
                      : "border-border"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Mesa {order.Session?.mesa?.number ?? "-"}
                          {isAllPrepared(order) && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              Pronto
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {order.name} • {getTimeAgo(order.created_at)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleExpand(order.id)}
                        className="h-8 w-8"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    {/* Items List */}
                    <div className="space-y-2">
                      {order.items.slice(0, expandedOrderId === order.id ? undefined : 2).map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                            item.prepared 
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.amount}x {item.Product.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePrepared(item.id, !item.prepared)}
                            className={`h-8 w-8 flex-shrink-0 ${
                              item.prepared 
                                ? "text-green-600 hover:text-green-700" 
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {item.prepared ? (
                              <FaCheckCircle className="h-4 w-4" />
                            ) : (
                              <FaRegCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}

                      {order.items.length > 2 && expandedOrderId !== order.id && (
                        <div className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleExpand(order.id)}
                            className="text-xs"
                          >
                            +{order.items.length - 2} mais itens
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Complete Order Button */}
                    {isAllPrepared(order) && (
                      <Button
                        onClick={() => handleCloseOrder(order.id)}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <FaCheck className="mr-2 h-3 w-3" />
                        Fechar Pedido
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Icon component para substituir o Lucide
const Utensils = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);