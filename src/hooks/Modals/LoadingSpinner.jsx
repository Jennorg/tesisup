import { createPortal } from "react-dom"; // 💡 1. Importar createPortal
import { FaSpinner } from "react-icons/fa";
import { motion } from "framer-motion";

export default function LoadingSpinner({ isOpen }) {
  if (!isOpen) return null;

  // 💡 2. Definir el contenido
  const spinnerContent = (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0.7, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-transparent rounded-full p-6 flex items-center justify-center"
      >
        <FaSpinner className="animate-spin text-blue-500 w-16 h-16" />
      </motion.div>
    </div>
  );

  // 💡 3. Renderizar usando el Portal
  return createPortal(spinnerContent, document.body);
}