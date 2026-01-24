import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import formatDate from "@/hooks/utils/formatDate";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import ConfirmationModal from "@/hooks/Modals/ConfirmationModal";
import StatusSelect from "./StatusSelect";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// ----------------------------------------------------------------------
// HOOK PERSONALIZADO: Eliminación de Tesis
// ----------------------------------------------------------------------
/**
 * Hook para manejar la lógica de eliminación de una tesis.
 * @param {string|number} tesisId - ID de la tesis.
 * @param {Function} onDeletedSuccess - Callback al completar la eliminación.
 * @param {Function} setModalState - Función para actualizar el estado del modal de carga.
 */
const useDeleteTesis = (tesisId, onDeletedSuccess, setModalState) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    setModalState({
      isOpen: true,
      status: "loading",
      message: `Eliminando tesis ${tesisId}...`,
    });

    try {
      await axios.delete(`${VITE_API_URL}/tesis/${tesisId}`);

      setModalState({
        isOpen: true,
        status: "success",
        message: "Tesis eliminada con éxito.",
      });

      onDeletedSuccess();
    } catch (err) {
      console.error(
        "Error al eliminar la tesis:",
        err.response?.data.error || err.message,
      );
      setModalState({
        isOpen: true,
        status: "error",
        message:
          err.response?.data.error ||
          "Error al eliminar la tesis. Intente de nuevo.",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  return { handleDelete, isDeleting };
};

// ----------------------------------------------------------------------
// HOOK PERSONALIZADO: Descarga de Tesis
// ----------------------------------------------------------------------
/**
 * Hook para manejar la descarga de archivos PDF de tesis.
 * @param {string|number} tesisId - ID de la tesis.
 * @param {Function} setModalState - Función para actualizar el estado del modal.
 */
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
        },
      );

      // Extracción del nombre del archivo desde las cabeceras
      const contentDisposition = response.headers["content-disposition"];
      let filename = `tesis_${tesisId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1].replace(/_+$/, "");
        }
      }

      // Crear enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setModalState({
        isOpen: true,
        status: "success",
        message: "¡Descarga iniciada!",
      });
    } catch (err) {
      console.error(
        "Error al descargar la tesis:",
        err.response?.data.error || err.message,
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

/**
 * Componente Card
 * Muestra la información resumida de una tesis y permite realizar acciones sobre ella.
 *
 * @param {Object} props
 * @param {Object} props.data - Datos de la tesis.
 * @param {boolean} props.isLoading - Estado de carga (muestra skeleton).
 * @param {Function} props.onTesisDeleted - Callback tras eliminar.
 * @param {Function} props.onEdit - Callback para editar la tesis.
 * @param {Function} props.onStatusChange - Callback para cambiar el estado.
 */
const Card = ({
  data,
  isLoading = false,
  onTesisDeleted,
  onEdit,
  onStatusChange,
}) => {
  const navigate = useNavigate();

  if (!data && !isLoading) {
    return null;
  }

  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Navegar al perfil al hacer clic en un nombre
  const navigateToProfile = (ci, userType) => {
    if (ci && userType) {
      navigate(`/profile/${userType}/${ci}`);
    }
  };

  const getUserTypeColor = (userType) => {
    return "#1976d2";
  };

  const { handleDelete, isDeleting } = useDeleteTesis(
    data?.id,
    onTesisDeleted,
    setModalState,
  );

  const { handleDownload, isDownloading } = useDownloadTesis(
    data?.id,
    setModalState,
  );

  // Renderizar Skeleton si está cargando
  if (isLoading) {
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

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    setIsConfirmOpen(true);
  };

  const handleExecuteDelete = () => {
    handleDelete();
    setIsConfirmOpen(false);
  };

  const handleCloseModal = () => {
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  return (
    <React.Fragment>
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleCloseModal}
      />

      <ConfirmationModal
        isOpen={isConfirmOpen}
        message={`¿Estás seguro de que quieres eliminar la tesis "${data.nombre}"? Esta acción es irreversible.`}
        onConfirm={handleExecuteDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      <div className="flex flex-col border-2 border-primary rounded-lg p-4 w-full gap-3 h-full bg-background-paper relative">
        {/* Etiqueta flotante con el ID de la tesis */}
        <span className="absolute top-2 right-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Código: {data.id_tesis || data.id}
        </span>

        {/* Contenedor del Título */}
        <div className="flex flex-col gap-1 pr-16">
          <Tooltip
            title={data.nombre}
            arrow
            placement="top"
            enterTouchDelay={0}
            leaveTouchDelay={2500}
          >
            <h2
              className="text-lg font-semibold text-text-primary line-clamp-2 cursor-default"
              aria-label={data.nombre}
              onClick={(e) => e.stopPropagation()}
            >
              {data.nombre}
            </h2>
          </Tooltip>
        </div>

        {/* Información de Metadatos (Estado, Fecha, Sede) */}
        <div className="flex flex-wrap gap-2 items-center">
          <StatusSelect
            tesisId={data.id || data.id_tesis}
            currentStatus={data.estado}
            onStatusChange={onStatusChange}
          />
          <span className="text-text-secondary text-sm">
            {formatDate(data.fecha)}
          </span>
          <span className="text-text-secondary text-sm">
            {typeof data.sede === "object" ? data.sede.nombre : data.sede}
          </span>
        </div>

        {/* Detalles de Personas (Autores, Encargados, Tutores, Jurados) */}
        <div className="space-y-1 flex-1">
          <p className="text-sm">
            <span className="text-text-secondary">Autor:</span>
            <span className="text-text-primary ml-1">
              {data.autores && data.autores.length > 0 ? (
                data.autores.map((autor, idx) => (
                  <React.Fragment key={idx}>
                    {autor.ci ? (
                      <Link
                        component="button"
                        variant="body2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToProfile(autor.ci, "estudiante");
                        }}
                        sx={{
                          cursor: "pointer",
                          textDecoration: "none",
                          color: getUserTypeColor("estudiante"),
                          fontWeight: 500,
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.05)",
                            textDecoration: "underline",
                            opacity: 1,
                          },
                        }}
                      >
                        {autor.nombre || autor.nombre_completo}
                      </Link>
                    ) : (
                      <span>{autor.nombre || autor.nombre_completo}</span>
                    )}
                    {idx < data.autores.length - 1 && ", "}
                  </React.Fragment>
                ))
              ) : data.autor?.ci ? (
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile(data.autor.ci, "estudiante");
                  }}
                  sx={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: getUserTypeColor("estudiante"),
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.05)",
                      textDecoration: "underline",
                      opacity: 1,
                    },
                  }}
                >
                  {data.autor.nombre || data.autor.nombre_completo}
                </Link>
              ) : (
                "No asignado"
              )}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-text-secondary">Encargado:</span>
            <span className="text-text-primary ml-1">
              {data.encargado?.ci ? (
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile(data.encargado.ci, "encargado");
                  }}
                  sx={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: getUserTypeColor("encargado"),
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.05)",
                      textDecoration: "underline",
                      opacity: 1,
                    },
                  }}
                >
                  {data.encargado.nombre ||
                    data.encargado.nombre_completo ||
                    "No asignado"}
                </Link>
              ) : (
                data.encargado?.nombre || "No asignado"
              )}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-text-secondary">Tutor:</span>
            <span className="text-text-primary ml-1">
              {data.tutor?.ci ? (
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile(data.tutor.ci, "profesor");
                  }}
                  sx={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: getUserTypeColor("profesor"),
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.05)",
                      textDecoration: "underline",
                      opacity: 1,
                    },
                  }}
                >
                  {data.tutor.nombre ||
                    data.tutor.nombre_completo ||
                    "No asignado"}
                </Link>
              ) : (
                data.tutor?.nombre || "No asignado"
              )}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-text-secondary">Jurado:</span>
            <span className="text-text-primary ml-1">
              {data.jurados && data.jurados.length > 0
                ? data.jurados.map((jurado, idx) => (
                    <React.Fragment key={idx}>
                      {jurado.ci ? (
                        <Link
                          component="button"
                          variant="body2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToProfile(jurado.ci, "profesor");
                          }}
                          sx={{
                            cursor: "pointer",
                            textDecoration: "none",
                            color: getUserTypeColor("profesor"),
                            fontWeight: 500,
                            "&:hover": {
                              backgroundColor: "rgba(0,0,0,0.05)",
                              textDecoration: "underline",
                              opacity: 1,
                            },
                          }}
                        >
                          {jurado.nombre || jurado.nombre_completo}
                        </Link>
                      ) : (
                        <span>{jurado.nombre || jurado.nombre_completo}</span>
                      )}
                      {idx < data.jurados.length - 1 && ", "}
                    </React.Fragment>
                  ))
                : "No asignado"}
            </span>
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            disabled={isDeleting || isDownloading || modalState.isOpen}
            sx={{
              flex: "1 1 auto",
              color: "var(--primary-main)",
              borderColor: "var(--primary-main)",
              "&:hover": {
                borderColor: "var(--primary-dark)",
                bgcolor: "rgba(59, 130, 246, 0.1)",
              },
            }}
          >
            Editar
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleConfirmDelete}
            disabled={isDeleting || modalState.isOpen}
            sx={{
              flex: "1 1 auto",
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
              flex: "1 1 auto",
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
