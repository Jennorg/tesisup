import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

/**
 * Componente ConfirmationModal
 * Modal genérico para solicitar confirmación del usuario antes de ejecutar una acción crítica.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado de visibilidad del modal.
 * @param {string} props.message - Mensaje de pregunta o advertencia.
 * @param {Function} props.onConfirm - Función a ejecutar al confirmar.
 * @param {Function} props.onCancel - Función a ejecutar al cancelar.
 */
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  return (
    <Modal open={isOpen} onClose={onCancel}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <p>{message}</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
