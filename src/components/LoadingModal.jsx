// LoadingModal.jsx
import { useEffect } from 'react';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function LoadingModal({ isOpen, status = "loading", message = "Cargando, por favor espera...", onClose }) {
  if (!isOpen) return null;

  // Icono dinámico según el estado
  let IconComponent = FaSpinner;
  let iconClass = "animate-spin text-blue-500";

  if (status === "success") {
    IconComponent = FaCheckCircle;
    iconClass = "text-green-500";
  } else if (status === "error") {
    IconComponent = FaTimesCircle;
    iconClass = "text-red-500";
  }

  // Efecto: cerrar modal automáticamente si es success o error
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timeout = setTimeout(() => {
        onClose?.(); // Llama a la función para cerrar el modal
      }, 1000); // 1 segundo

      return () => clearTimeout(timeout);
    }
  }, [status, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center gap-4"
      >
        <IconComponent className={`w-10 h-10 ${iconClass}`} />
        <p className="text-center text-gray-700 text-lg font-medium">
          {message}
        </p>
      </motion.div>
    </div>
  );
}
