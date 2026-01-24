import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { motion } from "framer-motion";

/**
 * Componente LoadingModal
 * Modal que muestra el estado de una operación asíncrona (Cargando, Éxito, Error).
 * Utiliza portales para renderizarse en el nivel superior del DOM (body).
 * Se cierra automáticamente después de 3 segundos si el estado es 'success' o 'error'.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de visibilidad.
 * @param {string} props.status - Estado actual: 'loading', 'success', 'error'.
 * @param {string} props.message - Mensaje a mostrar.
 * @param {Function} props.onClose - Función para cerrar el modal manualmente o tras timeout.
 */
export default function LoadingModal({
  isOpen,
  status = "loading",
  message = "Cargando, por favor espera...",
  onClose,
}) {
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

  // Efecto de cierre automático para estados finales
  useEffect(() => {
    if (status === "success" || status === "error") {
      const timeout = setTimeout(() => {
        onClose?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [status, onClose]);

  // Contenido del Modal con animaciones
  const modalContent = (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/50 backdrop-blur-sm">
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

  // Renderizar usando Portal para evitar conflictos de z-index o overflow
  return createPortal(modalContent, document.body);
}
