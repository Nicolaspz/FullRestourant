'use client';
import { Button } from "@/components/ui/button";
import { 
    X,
    AlertTriangle,
    Loader2,
    Trash2
} from "lucide-react";

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    item: any; // Ou use um tipo mais específico
    itemType?: string;
    isSubmitting: boolean;
}

export function DeleteDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    item, 
    itemType = "item",
    isSubmitting 
}: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop escuro */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Dialog */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100 opacity-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Confirmar Exclusão
                            </h3>
                            <p className="text-sm text-gray-400">
                                Ação irreversível
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-300">
                        Tem certeza que deseja excluir {itemType === 'ingredient' ? 'o ingrediente' : 'o usuário'}{" "}
                        <strong className="text-white">{item?.name}</strong>?
                    </p>
                    
                    {itemType === 'ingredient' && item && (
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                            <div className="text-sm text-gray-400 space-y-1">
                                <p><strong className="text-gray-300">Descrição:</strong> {item?.description || 'N/A'}</p>
                                <p><strong className="text-gray-300">Unidade:</strong> {item?.unit}</p>
                                <p><strong className="text-gray-300">Tipo:</strong> {item?.isDerived ? 'Derivado' : 'Simples'}</p>
                            </div>
                        </div>
                    )}
                    
                    {itemType === 'user' && item && (
                        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                            <div className="text-sm text-gray-400 space-y-1">
                                <p><strong className="text-gray-300">Email:</strong> {item?.email}</p>
                                <p><strong className="text-gray-300">Usuário:</strong> @{item?.user_name}</p>
                                <p><strong className="text-gray-300">Perfil:</strong> {item?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</p>
                            </div>
                        </div>
                    )}
                    
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        ⚠️ Esta ação não pode ser desfeita. Todos os dados serão permanentemente removidos.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-700 bg-gray-800/50 rounded-b-lg">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white transition-colors min-w-20"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}