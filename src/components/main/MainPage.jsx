import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
import tesisService from "@/services/tesis.service";
import TesisForm from "@/components/main/Form/ManagementForm.jsx"; // Formulario de gestión
import Header from "@/components/main/Layout/Header";
import Filters from "@/components/main/Layout/Filters";
import CustomPagination from "@/components/Ui/Pagination";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { Button, Menu, MenuItem } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

/**
 * Componente Principal (MainPage)
 * Gestiona la visualización de tesis, filtros, paginación, modales de creación/edición y descarga.
 */
const MainPage = () => {
  // Estados de UI y Datos
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [reloadTesisKey, setReloadTesisKey] = useState(0); // Forzar recarga de lista
  const [activeFilters, setActiveFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const tesisFormRef = useRef(null);

  // -- Configuración de Ordenamiento --
  // Se inicializa leyendo del localStorage para persistir preferencia del usuario
  const [sortConfig, setSortConfig] = useState(() => {
    const savedSort = localStorage.getItem("sortConfig");
    return savedSort ? JSON.parse(savedSort) : { key: null, direction: null };
  });

  // Guardar configuración de orden en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem("sortConfig", JSON.stringify(sortConfig));
  }, [sortConfig]);

  // Ancla para el menú de ordenamiento
  const [anchorEl, setAnchorEl] = useState(null);

  // -- Estado de Paginación --
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 9,
    total: 0,
  });

  // Estado para la tesis que se está editando actualmente
  const [tesisToEdit, setTesisToEdit] = useState(null);

  // Estado para el modal de descarga masiva
  const [downloadModal, setDownloadModal] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  // Cerrar modales al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideForm =
        tesisFormRef.current && tesisFormRef.current.contains(event.target);
      const isClickOnDropdown = event.target.closest(".MuiMenu-root");
      const isClickOnDatePicker = event.target.closest(
        ".MuiPickersPopper-root",
      );
      const isClickOnDialog = event.target.closest(".MuiDialog-root");
      const isClickOnDialogBackdrop = event.target.closest(".MuiBackdrop-root");

      if (
        isTesisFormVisible &&
        !isClickInsideForm &&
        !isClickOnDropdown &&
        !isClickOnDatePicker &&
        !isClickOnDialog &&
        !isClickOnDialogBackdrop
      ) {
        setIsTesisFormVisible(false);
        setTesisToEdit(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTesisFormVisible]);

  /**
   * Obtiene la lista de tesis desde el backend aplicando filtros, paginación y ordenamiento.
   */
  const fetchTesis = async () => {
    setIsLoading(true);
    setHaBuscado(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({
        page: paginationData.page,
        limit: paginationData.limit,
      });

      // Añadir parámetros de ordenamiento
      if (sortConfig.key && sortConfig.direction) {
        params.append("sortBy", sortConfig.key);
        params.append("order", sortConfig.direction);
      }

      // Añadir filtros activos
      if (activeFilters) {
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, value);
            }
          }
        });
      }

      // Añadir búsqueda por texto
      if (searchQuery) {
        params.append("cadena", searchQuery);
      }

      const response = await tesisService.getAll(params);

      if (response && Array.isArray(response.data)) {
        setTesisEncontradas(response.data);
        setPaginationData((prev) => ({
          ...prev,
          total: response.total,
        }));
      } else {
        console.warn("Respuesta inesperada de la API:", response.data);
        setTesisEncontradas([]);
        setPaginationData((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error("Error al buscar tesis:", error);
      setTesisEncontradas([]);
      setPaginationData((prev) => ({ ...prev, total: 0 }));
      setErrorMessage(
        error?.message?.includes("Network")
          ? "Error de conexión: no se pudo contactar al servidor."
          : "Error al obtener los datos de tesis.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para recargar tesis cuando cambian los parámetros
  useEffect(() => {
    fetchTesis();
  }, [
    paginationData.page,
    paginationData.limit,
    searchQuery,
    activeFilters,
    reloadTesisKey,
    sortConfig,
  ]);

  // Manejador para abrir el formulario en modo edición
  const handleEditTesis = (tesisData) => {
    setTesisToEdit(tesisData);
    setIsTesisFormVisible(true);
  };

  const handleCloseModal = () => {
    setIsTesisFormVisible(false);
    setTesisToEdit(null);
  };

  // Recargar lista tras una acción exitosa (crear/editar/eliminar)
  const handleSuccessModal = () => {
    setReloadTesisKey((k) => k + 1);
    setIsTesisFormVisible(false);
    setTesisToEdit(null);
  };

  // Actualización optimista del estado de una tesis en la lista
  const handleStatusChange = (tesisId, newStatus) => {
    setTesisEncontradas((prevTesis) =>
      prevTesis.map((tesis) => {
        const id = tesis.id || tesis.id_tesis;
        if (id === tesisId) {
          return { ...tesis, estado: newStatus };
        }
        return tesis;
      }),
    );
  };

  /**
   * Maneja la descarga masiva de todas las tesis.
   * Utiliza Server-Sent Events (SSE) para mostrar progreso en tiempo real.
   */
  const handleDownloadAll = async () => {
    setDownloadModal({
      isOpen: true,
      status: "loading",
      message: "Iniciando descarga de todas las tesis...",
    });

    let eventSource = null;
    let isDownloading = false;

    // Función interna para descargar el archivo final (ZIP)
    const downloadFile = async (downloadPath) => {
      if (isDownloading) {
        console.log("Descarga ya en progreso, ignorando.");
        return;
      }
      isDownloading = true;

      try {
        setDownloadModal({
          isOpen: true,
          status: "loading",
          message: "Descargando archivo...",
        });

        const downloadApiUrl = `${downloadPath}`;
        console.log("Descargando archivo desde:", downloadApiUrl);

        const { data: blob, headers } = await tesisService.downloadFile(
          downloadApiUrl,
          (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setDownloadModal({
                isOpen: true,
                status: "loading",
                message: `Descargando archivo... ${percentCompleted}% completado`,
              });
            }
          },
        );

        const contentType = headers["content-type"];
        const isZip = contentType && contentType.includes("application/zip");
        const firstBytes = await blob.slice(0, 2).text();

        // Validación básica de ZIP (PK header)
        if (!isZip || firstBytes !== "PK") {
          const text = await blob.text();
          try {
            const errorData = JSON.parse(text);
            throw new Error(
              errorData.message || "Error: La respuesta no es un ZIP válido",
            );
          } catch (parseError) {
            throw new Error("Error: La respuesta no es un ZIP válido");
          }
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Intentar obtener nombre del archivo
        const contentDisposition = headers["content-disposition"];
        let filename = "todas_las_tesis.zip";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename="?([^";]+)"?/,
          );
          if (filenameMatch && filenameMatch.length > 1) {
            filename = filenameMatch[1].replace(/_+$/, "");
          }
        }
        link.setAttribute("download", filename);

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        setDownloadModal({
          isOpen: true,
          status: "success",
          message: "¡Descarga completada exitosamente!",
        });
      } catch (error) {
        console.error("Error al descargar archivo:", error);
        isDownloading = false;
        throw error;
      }
    };

    try {
      // 1. Iniciar Job de descarga
      const { jobId, progressUrl, streamUrl } =
        await tesisService.initiateDownloadAll();

      console.log("Job iniciado:", { jobId, progressUrl, streamUrl });

      if (!jobId) {
        throw new Error("No se recibió un jobId del servidor");
      }

      setDownloadModal({
        isOpen: true,
        status: "loading",
        message: "Procesando tesis... Por favor espera.",
      });

      // 2. Conectar a SSE para progreso
      const sseUrl = `${import.meta.env.VITE_API_URL}${
        streamUrl || progressUrl || `/tesis/download/progress/${jobId}/stream`
      }`;
      console.log("Conectando a SSE:", sseUrl);

      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { total, processed, current, status, percentage, downloadUrl } =
            data;

          if (["completed", "done", "finished"].includes(status)) {
            // Proceso completado en servidor, iniciar descarga de archivo
            console.log("Proceso completado, iniciando descarga...");
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }

            const finalDownloadUrl =
              downloadUrl || `/tesis/download/result/${jobId}`;
            downloadFile(finalDownloadUrl).catch((error) => {
              setDownloadModal({
                isOpen: true,
                status: "error",
                message: error.message || "Error al descargar el archivo",
              });
            });
          } else if (["error", "failed"].includes(status)) {
            // Error en servidor
            console.error("Error en proceso:", data);
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }
            setDownloadModal({
              isOpen: true,
              status: "error",
              message: data.message || "Error al procesar las tesis",
            });
          } else if (total && processed !== undefined) {
            // Progreso numérico
            const percent =
              percentage !== undefined
                ? percentage
                : Math.round((processed / total) * 100);
            setDownloadModal({
              isOpen: true,
              status: "loading",
              message: `Procesando tesis... ${processed} de ${total} (${percent}%)${
                current ? ` - ${current}` : ""
              }`,
            });
          } else if (percentage !== undefined) {
            // Progreso porcentual
            setDownloadModal({
              isOpen: true,
              status: "loading",
              message: `Procesando tesis... ${percentage}% completado`,
            });
          } else {
            // Mensaje por defecto
            setDownloadModal({
              isOpen: true,
              status: "loading",
              message: "Procesando tesis... Por favor espera.",
            });
          }
        } catch (error) {
          console.error("Error parseando evento SSE:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("Error en SSE:", error);
        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
          console.log("Conexión SSE cerrada normalmente");
        } else {
          if (!isDownloading) {
            setDownloadModal({
              isOpen: true,
              status: "error",
              message:
                "Error en la conexión con el servidor. Intenta de nuevo.",
            });
          }
        }
      };
    } catch (error) {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      console.error("Error al iniciar descarga:", error);

      let errorMessage = "Error al descargar las tesis. Intenta de nuevo.";
      if (error.response?.data) {
        // Intentar extraer mensaje de error del backend
        const errData = error.response.data;
        if (typeof errData === "string") {
          try {
            const parsed = JSON.parse(errData);
            errorMessage = parsed.message || errorMessage;
          } catch (e) {
            errorMessage = errData;
          }
        } else {
          errorMessage = errData.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setDownloadModal({
        isOpen: true,
        status: "error",
        message: errorMessage,
      });
    }
  };

  const handleCloseDownloadModal = () => {
    setDownloadModal({
      isOpen: false,
      status: "loading",
      message: "",
    });
  };

  const handlePageChange = (newPage) => {
    setPaginationData((prev) => ({ ...prev, page: newPage }));
  };

  // Manejo de Menú de Ordenamiento
  const handleAttributeMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAttributeMenuClose = () => {
    setAnchorEl(null);
  };

  // Reiniciar a página 1 si cambia el orden
  useEffect(() => {
    setPaginationData((prev) => ({ ...prev, page: 1 }));
  }, [sortConfig]);

  const handleSelectAttribute = (key) => {
    setSortConfig({ key, direction: "asc" }); // Default ascendente
    handleAttributeMenuClose();
  };

  const handleToggleDirection = () => {
    setSortConfig((prev) => {
      if (!prev.key) return prev;
      const newDirection = prev.direction === "asc" ? "desc" : "asc";
      return { ...prev, direction: newDirection };
    });
  };

  return (
    <div className="flex flex-col h-dvh">
      <Header
        setIsLoading={setIsLoading}
        setHaBuscado={setHaBuscado}
        isFilterVisible={isFilterVisible}
        onToggleFilter={setIsFilterVisible}
        setPaginationData={setPaginationData}
        setSearchQuery={setSearchQuery}
      />
      <main className="relative z-10 flex-grow pr-4 pt-4 pl-4 overflow-y-auto transition-all duration-300">
        {/* Encabezado Principal y Controles */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-text-primary text-center md:text-left">
            Gestión de Tesis
          </h1>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            {/* Botón Selección de Atributo de Orden */}
            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleAttributeMenuOpen}
              sx={{
                color: "var(--primary-main)",
                borderColor: "var(--primary-main)",
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  borderColor: "var(--primary-dark)",
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                },
              }}
            >
              {sortConfig.key
                ? sortConfig.key === "fecha"
                  ? "Fecha"
                  : "Nombre"
                : "Sin orden"}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleAttributeMenuClose}
            >
              <MenuItem onClick={() => handleSelectAttribute("fecha")}>
                Fecha
              </MenuItem>
              <MenuItem onClick={() => handleSelectAttribute("nombre")}>
                Nombre
              </MenuItem>
            </Menu>

            {/* Botón Dirección de Orden Asc/Desc */}
            <Button
              variant="outlined"
              startIcon={
                sortConfig.direction === "asc" ? (
                  <ArrowUpwardIcon />
                ) : (
                  <ArrowDownwardIcon />
                )
              }
              onClick={handleToggleDirection}
              disabled={!sortConfig.key}
              sx={{
                color: "var(--primary-main)",
                borderColor: "var(--primary-main)",
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  borderColor: "var(--primary-dark)",
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                },
              }}
            >
              {sortConfig.direction
                ? sortConfig.direction === "asc"
                  ? "Asc"
                  : "Desc"
                : "Orden"}
            </Button>

            <button
              onClick={handleDownloadAll}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 w-full sm:w-auto"
            >
              Descargar tesis
            </button>
          </div>
        </div>

        {/* Contenido Principal (Lista de Tarjetas) */}
        <Content
          isTesisFormVisible={isTesisFormVisible}
          setIsTesisFormVisible={setIsTesisFormVisible}
          isLoading={isLoading}
          tesisEncontradas={tesisEncontradas}
          haBuscado={haBuscado}
          onEditTesis={handleEditTesis}
          onTesisDeleted={handleSuccessModal}
          onStatusChange={handleStatusChange}
          error={errorMessage}
        />

        {/* Componente de Paginación */}
        {paginationData.total > paginationData.limit && (
          <CustomPagination
            page={paginationData.page}
            limit={paginationData.limit}
            total={paginationData.total}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* Panel Lateral de Filtros */}
      <div
        className={`absolute top-0 left-0 h-full z-[60] transition-transform duration-300 ease-in-out ${
          isFilterVisible ? "translate-x-0" : "-translate-x-full"
        } w-full md:w-[400px]`}
      >
        <Filters
          onClose={() => setIsFilterVisible(false)}
          onApply={(f) => {
            setActiveFilters(f);
            setPaginationData((prev) => ({ ...prev, page: 1 })); // Resetear al filtrar
          }}
        />
      </div>

      {/* Modales */}
      {isTesisFormVisible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[95%] md:max-w-[800px] lg:max-w-[900px] xl:max-w-[1000px]">
            <TesisForm
              ref={tesisFormRef}
              onClose={handleCloseModal}
              onSuccess={handleSuccessModal}
              tesisToEdit={tesisToEdit}
            />
          </div>
        </div>
      ) : null}

      <LoadingModal
        isOpen={downloadModal.isOpen}
        status={downloadModal.status}
        message={downloadModal.message}
        onClose={handleCloseDownloadModal}
      />
    </div>
  );
};

export default MainPage;
