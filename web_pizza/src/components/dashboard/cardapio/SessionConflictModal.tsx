// components/menu/SessionConflictModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, User, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'; // Para Next.js 13+ App Router
// import { useRouter } from 'next/router'; // Para Next.js Pages Router

interface SessionConflictModalProps {
  isOpen: boolean;
  conflict: {
    message: string;
    existingClientToken?: string;
  } | null;
  tableNumber: string;
  currentToken?: string;
  onClose: () => void;
  onSync: () => void;
  onCreateNew: () => void;
}

export function SessionConflictModal({
  isOpen,
  conflict,
  tableNumber,
  currentToken,
  onClose,
  onSync,
  onCreateNew
}: SessionConflictModalProps) {
  const router = useRouter();

  const handleGoBack = () => {
    // Fecha o modal primeiro
    onClose();
    // Volta para a página /cardapio
    router.push('/dashboard/cardapio');
  };

  if (!isOpen || !conflict) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
        onClick={handleGoBack} // Agora fecha e volta ao clicar no overlay
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-100">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">
                Conflito de Mesa
              </h3>
              <p className="text-sm mb-4 text-gray-600">
                {conflict.message}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onSync}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              Sim, é o mesmo cliente
            </Button>
            <button
              onClick={handleGoBack} // Agora volta para /cardapio
              className="w-full py-2 text-sm font-medium text-gray-600 hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              Ler Qr novamente ou Inserir outra Mesa!
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Ao sincronizar, você se juntará ao pedido existente nesta mesa
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}