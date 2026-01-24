import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Select, MenuItem, FormControl } from "@mui/material";
import ConfirmationModal from "@/hooks/Modals/ConfirmationModal";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { ThemeContext } from "@/context/ThemeContext";

const VITE_API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene los estilos de color según el estado y el modo del tema.
 * @param {string} status - Estado de la tesis (aprobado, rechazado, pendiente).
 * @param {string} mode - Modo de tema (light, dark).
 * @returns {Object} Objeto con propiedades bgcolor y color.
 */
const getStatusColor = (status, mode) => {
  const color = mode === "dark" ? "#fff" : "#000";
  switch (status) {
    case "aprobado":
      return {
        bgcolor: "rgba(76, 175, 80, 0.6)", // Verde
        color,
      };
    case "rechazado":
      return {
        bgcolor: "rgba(244, 67, 54, 0.6)", // Rojo
        color,
      };
    case "pendiente":
      return {
        bgcolor: "rgba(255, 235, 59, 0.7)", // Amarillo
        color,
      };
    default:
      return {
        bgcolor: "var(--secondary-main)",
        color: "var(--text-primary)",
      };
  }
};

/**
 * Componente StatusSelect
 * Selector desplegable para cambiar el estado de una tesis (aprobado, pendiente, rechazado).
 * Incluye confirmación antes de aplicar cambios.
 *
 * @param {Object} props
 * @param {string|number} props.tesisId - ID de la tesis.
 * @param {string} props.currentStatus - Estado actual.
 * @param {Function} props.onStatusChange - Callback al cambiar estado exitosamente.
 */
const StatusSelect = ({ tesisId, currentStatus, onStatusChange }) => {
  const { mode } = useContext(ThemeContext);
  const [status, setStatus] = useState(currentStatus || "");
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  // Sincronizar estado local si cambia la prop
  useEffect(() => {
    if (currentStatus !== status) {
      setStatus(currentStatus || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus]);

  const statusOptions = [
    { value: "aprobado", label: "Aprobado" },
    { value: "rechazado", label: "Rechazado" },
    { value: "pendiente", label: "Pendiente" },
  ];

  // Maneja el intento de cambio de estado (abre modal de confirmación)
  const handleChange = (e) => {
    const newStatus = e.target.value;
    const statusLabel =
      statusOptions.find((opt) => opt.value === newStatus)?.label || newStatus;
    const currentStatusLabel =
      statusOptions.find((opt) => opt.value === status)?.label || status;

    setConfirmationModal({
      isOpen: true,
      message: `¿Está seguro de que desea cambiar el estado de "${currentStatusLabel}" a "${statusLabel}"?`,
      onConfirm: () => handleUpdate(newStatus),
    });
  };

  // Ejecuta la actualización en el servidor
  const handleUpdate = async (newStatus) => {
    setModalState({
      isOpen: true,
      status: "loading",
      message: "Actualizando estado...",
    });

    try {
      await axios.put(
        `${VITE_API_URL}/tesis/${tesisId}/status`,
        { estado: newStatus },
        { withCredentials: true },
      );
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(tesisId, newStatus);
      }
      setModalState({
        isOpen: true,
        status: "success",
        message: "Estado actualizado con éxito.",
      });
    } catch (err) {
      console.error("Error al actualizar el estado:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al actualizar el estado.";
      setModalState({
        isOpen: true,
        status: "error",
        message: errorMessage,
      });
    }
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
  };

  const statusColorStyle = getStatusColor(status, mode);

  return (
    <>
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleCloseModal}
      />
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        message={confirmationModal.message}
        onConfirm={() => {
          if (confirmationModal.onConfirm) {
            confirmationModal.onConfirm();
          }
          handleCloseConfirmation();
        }}
        onCancel={handleCloseConfirmation}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={status}
          onChange={handleChange}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          sx={{
            ...statusColorStyle,
            fontSize: "0.875rem",
            height: "28px",
            borderRadius: "9999px",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSelect-select": {
              padding: "4px 12px",
            },
            "& .MuiSvgIcon-root": {
              color: statusColorStyle.color,
            },
          }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

export default StatusSelect;
