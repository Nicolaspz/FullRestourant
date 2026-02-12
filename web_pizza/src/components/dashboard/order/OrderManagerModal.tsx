import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setupAPIClient } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Trash2, XCircle, CheckCircle, Minus, Plus } from 'lucide-react';

interface RecipeItem {
    id: string;
    ingredient: {
        name: string;
    };
}

interface Product {
    id: string;
    name: string;
    price: string;
    isDerived: boolean;
    recipeItems: RecipeItem[];
}

interface OrderItem {
    id: string;
    amount: number;
    product: Product;
    Product?: Product;
    prepared: boolean;
    status?: string;
    canceled?: boolean;
}

interface OrderDetails {
    id: string;
    table?: number;
    name?: string;
    status: boolean;
    draft: boolean;
    items: OrderItem[];
}

interface OrderManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    onOrderUpdated?: () => void;
}

export function OrderManagerModal({ isOpen, onClose, orderId, onOrderUpdated }: OrderManagerModalProps) {
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processingItemId, setProcessingItemId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && orderId) {
            loadOrderDetails();
        }
    }, [isOpen, orderId]);

    async function loadOrderDetails() {
        setLoading(true);
        try {
            const apiClient = setupAPIClient();
            const response = await apiClient.get('/order/details', {
                params: { id_order: orderId }
            });

            if (Array.isArray(response.data)) {
                setOrder({ id: orderId, items: response.data } as any);
            } else {
                setOrder(response.data);
            }
        } catch (err) {
            toast.error("Erro ao carregar detalhes do pedido.");
        } finally {
            setLoading(false);
        }
    }

    /* ======================================================
       AÇÕES
    ====================================================== */

    // 1. Cancelar Item Individual
    async function handleCancelItem(itemId: string) {
        if (!confirm("Tem certeza? O stock será estornado.")) return;

        setProcessing(true);
        setProcessingItemId(itemId);
        try {
            const apiClient = setupAPIClient();
            await apiClient.delete(`/orders/items/${itemId}`);
            toast.success("Item cancelado!");
            loadOrderDetails();
            onOrderUpdated?.();
        } catch (err: any) {
            const msg = err.response?.data?.error || "Erro ao cancelar item.";
            toast.error(msg);
        } finally {
            setProcessing(false);
            setProcessingItemId(null);
        }
    }

    // 2. Atualizar Quantidade (Apenas Diminuir)
    async function handleDecreaseQuantity(item: OrderItem) {
        if (item.amount <= 1) {
            // Se for 1, a ação deve ser cancelar o item
            handleCancelItem(item.id);
            return;
        }

        setProcessing(true);
        setProcessingItemId(item.id);

        try {
            const newQuantity = item.amount - 1;
            const apiClient = setupAPIClient();
            await apiClient.put(`/orders/items/${item.id}/quantity`, {
                quantity: newQuantity
            });
            toast.success("Quantidade reduzida e stock estornado.");
            loadOrderDetails();
            // onOrderUpdated?.(); // Talvez não precise recarregar tudo lá fora para update de qtd
        } catch (err: any) {
            const msg = err.response?.data?.error || "Erro ao atualizar quantidade.";
            toast.error(msg);
        } finally {
            setProcessing(false);
            setProcessingItemId(null);
        }
    }

    // 3. Limpar Itens Não Preparados
    async function handleCleanUnprepared() {
        if (!confirm("Remover TODOS itens pendentes?")) return;

        setProcessing(true);
        try {
            const apiClient = setupAPIClient();
            const response = await apiClient.delete(`/orders/${orderId}/clean-unprepared`);
            toast.success(response.data.message || "Itens removidos.");
            loadOrderDetails();
            onOrderUpdated?.();
        } catch (err: any) {
            const msg = err.response?.data?.error || "Erro ao limpar itens.";
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    }

    // 4. Cancelar Pedido Completo
    async function handleCancelOrder() {
        if (!confirm("Cancelar pedido INTEIRO? Só possível se NADA estiver preparado.")) return;

        setProcessing(true);
        try {
            const apiClient = setupAPIClient();
            await apiClient.delete(`/orders/${orderId}`);
            toast.success("Pedido cancelado.");
            onOrderUpdated?.();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.error || "Erro ao cancelar pedido.";
            toast.error(msg);
        } finally {
            setProcessing(false);
        }
    }

    /* ======================================================
       RENDER
    ====================================================== */

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl">Gestão de Pedido #{orderId?.slice(0, 8)}</DialogTitle>
                    <DialogDescription>
                        Ajuste quantidades ou cancele itens.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 pr-4">
                            {order?.items && order.items.length > 0 ? (
                                <div className="space-y-3 pt-2">
                                    {order.items.map((item) => {
                                        const product = item.product || item.Product;
                                        const isPrepared = item.prepared || item.status === 'pronto' || item.status === 'em_preparacao';
                                        const isCanceled = item.canceled;
                                        const isProcessingThis = processingItemId === item.id;

                                        return (
                                            <div key={item.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg transition-colors ${isCanceled ? 'bg-red-50/50 border-red-100 opacity-70' : 'bg-white hover:bg-slate-50'
                                                }`}>

                                                {/* Info Produto */}
                                                <div className="flex-1 mb-2 sm:mb-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${isCanceled ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                            {product?.name || "Produto"}
                                                        </span>
                                                        {isCanceled && <Badge variant="destructive" className="text-[10px] h-5 px-1">Cancelado</Badge>}
                                                        {isPrepared && !isCanceled && <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-800 hover:bg-green-100 h-5 px-1 border-green-200">Preparado</Badge>}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {isCanceled ? "Estorno realizado" : isPrepared ? "Já enviado à cozinha" : "Pendente de preparo"}
                                                    </div>
                                                </div>

                                                {/* Controles */}
                                                <div className="flex items-center gap-4">

                                                    {/* Quantidade Control */}
                                                    {!isCanceled && !isPrepared && (
                                                        <div className="flex items-center border rounded-md bg-white">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-r-none text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                disabled={processing || isProcessingThis}
                                                                onClick={() => handleDecreaseQuantity(item)}
                                                                title="Diminuir quantidade (estorna stock)"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </Button>
                                                            <div className="w-8 text-center text-sm font-medium">
                                                                {isProcessingThis ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : item.amount}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-l-none text-muted-foreground cursor-not-allowed opacity-50"
                                                                title="Para aumentar, adicione um novo item ao pedido"
                                                                disabled
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Quantidade Display (se preparado ou cancelado) */}
                                                    {(isCanceled || isPrepared) && (
                                                        <div className="font-semibold text-sm px-3">
                                                            Qt: {item.amount}
                                                        </div>
                                                    )}

                                                    {/* Botão Cancelar Item (Só se não cancelado e não preparado) */}
                                                    {!isCanceled && !isPrepared && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                            disabled={processing || isProcessingThis}
                                                            onClick={() => handleCancelItem(item.id)}
                                                            title="Cancelar item inteiro"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    Nenhum item encontrado.
                                </div>
                            )}
                        </ScrollArea>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                            {/* Informações Extras se necessário */}
                            <div className="flex-1"></div>

                            <Button
                                variant="outline"
                                onClick={handleCleanUnprepared}
                                disabled={processing}
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Limpar Pendentes
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleCancelOrder}
                                disabled={processing}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancelar Pedido
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
