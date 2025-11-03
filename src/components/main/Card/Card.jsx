import React, { useState } from "react";
import axios from "axios";
import formatDate from "@/hooks/utils/formatDate";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
// Asegúrate de importar tu modal de carga
import LoadingModal from "@/hooks/Modals/LoadingModal";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// ----------------------------------------------------------------------
// HOOK DE ELIMINACIÓN: Conecta la UI con la API y gestiona el estado del modal
// ----------------------------------------------------------------------
const useDeleteTesis = (tesisId, onDeletedSuccess, setModalState) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Mostrar modal de CARGA
    setModalState({
      isOpen: true,
      status: "loading",
      message: `Eliminando tesis ${tesisId}...`,
    });

    try {
      await axios.delete(`${VITE_API_URL}/tesis/${tesisId}`);

      // Mostrar modal de ÉXITO
      setModalState({
        isOpen: true,
        status: "success",
        message: "Tesis eliminada con éxito.",
      });

      // Llama al callback del padre para recargar/actualizar la lista después del timeout del modal
      onDeletedSuccess();
    } catch (err) {
      console.error(
        "Error al eliminar la tesis:",
        err.response?.data.error || err.message
      );
      // Mostrar modal de ERROR
      setModalState({
        isOpen: true,
        status: "error",
        message:
          err.response?.data.error ||
          "Error al eliminar la tesis. Intente de nuevo.",
      });
    } finally {
      setIsDeleting(false);
      // El modal se cierra solo después de 1 segundo (definido en LoadingModal.jsx)
    }
  };
  return { handleDelete, isDeleting };
};

// ----------------------------------------------------------------------
// HOOK DE DESCARGA: Conecta la UI con la API para descargar archivos
// ----------------------------------------------------------------------
const useDownloadTesis = (tesisId, setModalState) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setModalState({
      isOpen: true,
      status: "loading",
      message: `Preparando descarga para la tesis ${tesisId}...`,
    });

    try {
      const response = await axios.get(
        `${VITE_API_URL}/tesis/${tesisId}/download`,
        {
          responseType: "blob",
        }
      );

      // Extraer el nombre del archivo de los headers
      const contentDisposition = response.headers["content-disposition"];
      let filename = `tesis_${tesisId}.pdf`; // Nombre por defecto
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      // Crear una URL para el blob y simular un clic para descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Limpiar

      setModalState({
        isOpen: true,
        status: "success",
        message: "¡Descarga iniciada!",
      });
    } catch (err) {
      console.error(
        "Error al descargar la tesis:",
        err.response?.data.error || err.message
      );
      setModalState({
        isOpen: true,
        status: "error",
        message:
          err.response?.data.error ||
          "Error al descargar el archivo. Intente de nuevo.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return { handleDownload, isDownloading };
};

const Card = ({ data, isLoading = false, onTesisDeleted }) => {
  if (!data && !isLoading) {
    return null;
  }

  // Estado del modal de carga/éxito/error
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  // 💡 NOTA: La lógica del hook ahora se ejecuta SOLO si 'data' existe.
  // Esto es crucial para evitar el error "reading 'id'".
  const { handleDelete, isDeleting } = useDeleteTesis(
    data?.id, // Pasamos data.id (con optional chaining por si acaso)
    onTesisDeleted,
    setModalState
  );

  const { handleDownload, isDownloading } = useDownloadTesis(
    data?.id,
    setModalState
  );

  if (isLoading) {
    // ... (código de Skeleton) ...
    return (
      <div className="flex flex-col w-full gap-2 animate-pulse border-gray-800 border-2 p-4 rounded-lg h-full">
        <Skeleton variant="text" width="60%" height={32} />
        <div className="space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="75%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="65%" />
        </div>
        <div className="flex gap-2 mt-auto">
          <Skeleton variant="rectangular" width={120} height={36} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </div>
      </div>
    );
  }

  // Función que maneja la confirmación
  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    // Usamos el ID para mayor claridad
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar la tesis "${data.nombre}" (ID: ${data.id})? Esta acción es irreversible.`
      )
    ) {
      handleDelete(); // Llama a la lógica de DELETE
    }
  };

  // Función para cerrar el modal manualmente (si es necesario)
  const handleCloseModal = () => {
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  return (
    <React.Fragment>
      {/* Modal de Carga, Éxito o Error */}
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleCloseModal}
      />

      <div className="flex flex-col border-2 border-primary rounded-lg p-4 w-full gap-3 h-full bg-background-paper">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-text-primary line-clamp-2">
            {data.nombre}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="bg-secondary-main px-3 py-1 rounded-full text-text-primary text-sm">
            {data.estado}
          </span>
          <span className="text-text-secondary text-sm">
            {formatDate(data.fecha)}
          </span>
          <span className="text-text-secondary text-sm">{data.sede}</span>
        </div>

        <div className="space-y-1 flex-1">
          <p className="text-sm">
            <span className="text-text-secondary">Autor:</span>
            <span className="text-text-primary ml-1">
              {data.autores?.map((autor) => autor.nombre).join(", ") ||
                "No asignado"}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-text-secondary">Encargado:</span>
            <span className="text-text-primary ml-1">
              {data.encargado?.nombre || "No asignado"}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-text-secondary">Tutor:</span>
            <span className="text-text-primary ml-1">
              {data.tutor?.nombre || "No asignado"}
            </span>
          </p>
        </div>

        <div className="flex gap-2 mt-auto">
          <Button
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleConfirmDelete}
            disabled={isDeleting || modalState.isOpen}
            sx={{
              color: "var(--error-main)",
              borderColor: "var(--error-main)",
              "&:hover": {
                borderColor: "var(--error-dark)",
                bgcolor: "rgba(239, 68, 68, 0.1)",
              },
            }}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>

          <Button
            variant="contained"
            size="small"
            endIcon={<DownloadIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            disabled={isDownloading || modalState.isOpen}
            sx={{
              bgcolor: "var(--primary-main)",
              "&:hover": {
                bgcolor: "var(--primary-dark)",
              },
            }}
          >
            {isDownloading ? "Descargando..." : "Descargar"}
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Card;
