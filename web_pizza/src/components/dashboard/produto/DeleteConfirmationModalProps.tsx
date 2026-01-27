'use client';
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types/product";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  isSubmitting: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  isSubmitting
}: DeleteConfirmationModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-background text-foreground rounded-lg shadow-lg w-full max-w-md border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Confirmar Exclusão</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground">
            Tem certeza que deseja excluir o produto{" "}
            <strong className="text-red-600 dark:text-red-400">{product?.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os dados relacionados a este produto serão permanentemente removidos do sistema.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-muted/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-border hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}