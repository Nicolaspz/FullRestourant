'use client';

import { Button } from "@/components/ui/button";
import { Loader2, Trash2, X } from "lucide-react";
import { Ingredient } from "@/types/product"; 

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ingredient: Ingredient | null;
  isSubmitting: boolean;
}

export function DeleteDialog({ isOpen, onClose, onConfirm, ingredient, isSubmitting }: DeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-background border rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Confirmar Exclusão
              </h3>
              <p className="text-sm text-muted-foreground">
                Ação irreversível
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-foreground">
            Tem certeza que deseja excluir o ingrediente{" "}
            <strong>{ingredient?.name}</strong>?
          </p>
          <div className="bg-muted rounded-lg p-3 border">
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Categoria:</strong> {ingredient?.category?.name || 'N/A'}</p>
              <p><strong>Unidade:</strong> {ingredient?.unit}</p>
              <p><strong>Tipo:</strong> {ingredient?.isDerived ? 'Derivado' : 'Simples'}</p>
            </div>
          </div>
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            ⚠️ Esta ação não pode ser desfeita. Todos os dados do ingrediente serão permanentemente removidos.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-muted/50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            variant="destructive"
            className="min-w-20"
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