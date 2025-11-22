import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
import axios from "axios";
import TesisForm from "@/components/main/Form/ManagementForm.jsx"; // Tu alias para ManagementForm
import Header from "@/components/main/Layout/Header";
import Filters from "@/components/main/Layout/Filters";
import CustomPagination from "@/components/Ui/Pagination"; // Importado para la paginación
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { Button, Menu, MenuItem } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const MainPage = () => {
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [reloadTesisKey, setReloadTesisKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Añadido para la nueva lógica
  const [errorMessage, setErrorMessage] = useState(null);
  const tesisFormRef = useRef(null);
  
  
  // Estado para el ordenamiento - initialize from localStorage
  const [sortConfig, setSortConfig] = useState(() => {
    const savedSort = localStorage.getItem('sortConfig');
    return savedSort ? JSON.parse(savedSort) : { key: null, direction: null };
  });

  // Persist sortConfig to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sortConfig', JSON.stringify(sortConfig));
  }, [sortConfig]);
  // Anchor for attribute menu
  const [anchorEl, setAnchorEl] = useState(null);
  // Estado para la paginación (de la nueva lógica)
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 9,
    total: 0,
  });

  // Estado para guardar la tesis que se va a editar
  const [tesisToEdit, setTesisToEdit] = useState(null);
  
  // Estado para el modal de descarga
  const [downloadModal, setDownloadModal] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  // useEffect para cerrar el modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ... (tu lógica de clic fuera, sin cambios)
      const isClickInsideForm =
        tesisFormRef.current && tesisFormRef.current.contains(event.target);
      const isClickOnDropdown = event.target.closest(".MuiMenu-root");
      const isClickOnDatePicker = event.target.closest(
        ".MuiPickersPopper-root"
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

  // useEffect para cargar los datos (lógica de paginación)
  const fetchTesis = async () => {
    setIsLoading(true);
    setHaBuscado(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({
        page: paginationData.page,
        limit: paginationData.limit,
      });
      // Add sorting parameters if set
      if (sortConfig.key && sortConfig.direction) {
        params.append('sortBy', sortConfig.key);
        params.append('order', sortConfig.direction);
      }

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

      if (searchQuery) {
        params.append("cadena", searchQuery);
      }

      const apiUrl = `${import.meta.env.VITE_API_URL}/tesis`;
      const response = await axios.get(apiUrl, {
        params,
        withCredentials: true,
      });

      if (response.data && Array.isArray(response.data.data)) {
        setTesisEncontradas(response.data.data);
        setPaginationData((prev) => ({
          ...prev,
          total: response.data.total,
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
        error?.message?.includes('Network')
          ? "Error de conexión: no se pudo contactar al servidor."
          : "Error al obtener los datos de tesis."
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  // Función para manejar el clic de "Editar"
  const handleEditTesis = (tesisData) => {
    setTesisToEdit(tesisData);
    setIsTesisFormVisible(true);
  };

  // Funciones de cierre y éxito actualizadas
  const handleCloseModal = () => {
    setIsTesisFormVisible(false);
    setTesisToEdit(null);
  };

  const handleSuccessModal = () => {
    setReloadTesisKey((k) => k + 1); // Recargar la lista
    setIsTesisFormVisible(false);
    setTesisToEdit(null);
  };

  // Función para actualizar el estado de una tesis
  const handleStatusChange = (tesisId, newStatus) => {
    setTesisEncontradas((prevTesis) =>
      prevTesis.map((tesis) => {
        const id = tesis.id || tesis.id_tesis;
        if (id === tesisId) {
          return { ...tesis, estado: newStatus };
        }
        return tesis;
      })
    );
  };

  // --- FUNCIÓN DE DESCARGA AÑADIDA ---
  const handleDownloadAll = async () => {
    // Mostrar modal de carga
    setDownloadModal({
      isOpen: true,
      status: "loading",
      message: "Iniciando descarga de todas las tesis...",
    });

    let eventSource = null;
    let isDownloading = false; // Flag para evitar múltiples descargas

    // Función auxiliar para descargar el archivo
    const downloadFile = async (downloadPath) => {
      if (isDownloading) {
        console.log("La descarga ya está en progreso, ignorando llamada duplicada");
        return;
      }
      isDownloading = true;

      try {
        setDownloadModal({
          isOpen: true,
          status: "loading",
          message: "Descargando archivo...",
        });

        const downloadApiUrl = `${import.meta.env.VITE_API_URL}${downloadPath}`;
        console.log("Descargando archivo desde:", downloadApiUrl);

        // Para la descarga del archivo, no usar withCredentials si causa problemas de CORS
        const response = await axios.get(downloadApiUrl, {
          responseType: "blob",
          withCredentials: true,
          timeout: 300000, // 5 minutos
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setDownloadModal({
                isOpen: true,
                status: "loading",
                message: `Descargando archivo... ${percentCompleted}% completado`,
              });
            }
          },
        });

        const blob = response.data;
        const contentType = response.headers["content-type"];

        // Verificar que sea un ZIP
        const isZip = contentType && contentType.includes("application/zip");
        const firstBytes = await blob.slice(0, 2).text();

        if (!isZip || firstBytes !== "PK") {
          const text = await blob.text();
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || "Error: La respuesta no es un archivo ZIP válido");
          } catch (parseError) {
            throw new Error("Error: La respuesta no es un archivo ZIP válido");
          }
        }

        // Crear una URL para el blob y un enlace para la descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Extraer el nombre del archivo de las cabeceras si está disponible
        const contentDisposition = response.headers["content-disposition"];
        let filename = "todas_las_tesis.zip"; // Nombre por defecto
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
          if (filenameMatch && filenameMatch.length > 1) {
            filename = filenameMatch[1].replace(/_+$/, ""); // Remove trailing underscores
          }
        }
        link.setAttribute("download", filename);

        // Simular clic para iniciar la descarga y luego limpiar
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Mostrar modal de éxito
        setDownloadModal({
          isOpen: true,
          status: "success",
          message: "¡Descarga completada exitosamente!",
        });
      } catch (error) {
        console.error("Error al descargar el archivo:", error);
        isDownloading = false;
        throw error;
      }
    };

    try {
      // Paso 1: Iniciar el proceso de descarga y obtener el jobId
      const apiUrl = `${import.meta.env.VITE_API_URL}/tesis/download/all`;
      const initResponse = await axios.get(apiUrl, {
        withCredentials: true,
      });

      // El backend devuelve un JSON con jobId y URLs
      const { jobId, progressUrl, streamUrl } = initResponse.data;

      console.log("Job iniciado:", { jobId, progressUrl, streamUrl });

      if (!jobId) {
        throw new Error("No se recibió un jobId del servidor");
      }

      setDownloadModal({
        isOpen: true,
        status: "loading",
        message: "Procesando tesis... Por favor espera.",
      });

      // Paso 2: Usar Server-Sent Events (SSE) para recibir actualizaciones de progreso
      const sseUrl = `${import.meta.env.VITE_API_URL}${streamUrl || progressUrl || `/tesis/download/progress/${jobId}/stream`}`;
      console.log("Conectando a SSE:", sseUrl);

      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Evento SSE recibido:", data);

          const { total, processed, current, status, percentage, downloadUrl } = data;

          if (status === "completed" || status === "done" || status === "finished") {
            // El proceso está completo
            console.log("Proceso completado, iniciando descarga...");
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }

            // Descargar el archivo usando el downloadUrl proporcionado
            const finalDownloadUrl = downloadUrl || `/tesis/download/result/${jobId}`;
            downloadFile(finalDownloadUrl).catch((error) => {
              console.error("Error al descargar:", error);
              setDownloadModal({
                isOpen: true,
                status: "error",
                message: error.message || "Error al descargar el archivo",
              });
            });
          } else if (status === "error" || status === "failed") {
            // Hubo un error
            console.error("Error en el proceso:", data);
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
            // Mostrar progreso numérico
            const percent = percentage !== undefined ? percentage : Math.round((processed / total) * 100);
            setDownloadModal({
              isOpen: true,
              status: "loading",
              message: `Procesando tesis... ${processed} de ${total} (${percent}%)${current ? ` - ${current}` : ""}`,
            });
          } else if (current) {
            // Mostrar tesis actual
            setDownloadModal({
              isOpen: true,
              status: "loading",
              message: `Procesando tesis: ${current}...`,
            });
          } else if (percentage !== undefined) {
            // Mostrar solo porcentaje
            setDownloadModal({
              isOpen: true,
              status: "loading",
              message: `Procesando tesis... ${percentage}% completado`,
            });
          } else {
            // Si no hay información específica, mostrar mensaje genérico
            setDownloadModal({
              isOpen: true,
              status: "loading",
              message: "Procesando tesis... Por favor espera.",
            });
          }
        } catch (error) {
          console.error("Error al parsear evento SSE:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("Error en SSE:", error);
        // Si el evento se cierra normalmente (readyState === 2), no es un error
        if (eventSource && eventSource.readyState === EventSource.CLOSED) {
          console.log("Conexión SSE cerrada normalmente");
        } else {
          // Solo mostrar error si no estamos descargando
          if (!isDownloading) {
            setDownloadModal({
              isOpen: true,
              status: "error",
              message: "Error en la conexión con el servidor. Intenta de nuevo.",
            });
          }
        }
      };

    } catch (error) {
      // Cerrar SSE si está abierto
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      console.error("Error al descargar las tesis:", error);
      
      // Intentar parsear el error si viene como JSON
      let errorMessage = "Error al descargar las tesis. Intenta de nuevo.";
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          try {
            const errorData = JSON.parse(error.response.data);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = error.response.data;
          }
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar modal de error
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

  // Handler para la paginación
  const handlePageChange = (newPage) => {
    setPaginationData((prev) => ({ ...prev, page: newPage }));
  };

  // Handlers para el menú de selección de atributo
  const handleAttributeMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAttributeMenuClose = () => {
    setAnchorEl(null);
  };

  // Reset pagination page when sorting changes
  useEffect(() => {
    setPaginationData((prev) => ({ ...prev, page: 1 }));
  }, [sortConfig]);

  const handleSelectAttribute = (key) => {
    // Set selected attribute with default ascending direction
    setSortConfig({ key, direction: "asc" });
    handleAttributeMenuClose();
  };

  // Handler para alternar dirección del atributo actual
  const handleToggleDirection = () => {
    setSortConfig((prev) => {
      if (!prev.key) return prev; // No attribute selected
      const newDirection = prev.direction === "asc" ? "desc" : "asc";
      return { ...prev, direction: newDirection };
    });
  };

  // Función para ordenar las tesis (now handled by backend, but keeping for client-side if needed)
  const getSortedTesis = () => {
    if (!sortConfig.key || !sortConfig.direction) {
      return tesisEncontradas;
    }

    const sorted = [...tesisEncontradas].sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === "fecha") {
        aValue = new Date(a.fecha);
        bValue = new Date(b.fecha);
      } else if (sortConfig.key === "nombre") {
        aValue = (a.nombre || "").toLowerCase();
        bValue = (b.nombre || "").toLowerCase();
      }

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  };

  const sortedTesis = getSortedTesis();

  return (
    <div className="flex flex-col h-dvh">
      <Header
        setIsLoading={setIsLoading}
        setHaBuscado={setHaBuscado}
        isFilterVisible={isFilterVisible}
        onToggleFilter={setIsFilterVisible}
        setPaginationData={setPaginationData} // Prop para la nueva lógica
        setSearchQuery={setSearchQuery} // Prop para la nueva lógica
      />
      <main
        className="relative z-10 flex-grow pr-4 pt-4 pl-4 overflow-y-auto transition-all duration-300"
      >
        {/* --- H1 Y BOTONES DE DESCARGA Y ORDENAMIENTO --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-text-primary text-center md:text-left">
            Gestión de Tesis
          </h1>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            {/* Botón para seleccionar atributo */}
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
            {/* Menú de selección de atributo */}
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
            {/* Botón para alternar dirección */}
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

      <Content
          isTesisFormVisible={isTesisFormVisible}
          setIsTesisFormVisible={setIsTesisFormVisible} // Para el botón "Añadir"
          isLoading={isLoading}
          tesisEncontradas={tesisEncontradas}
          haBuscado={haBuscado}
          onEditTesis={handleEditTesis}
          onTesisDeleted={handleSuccessModal}
          onStatusChange={handleStatusChange}
          error={errorMessage}
        />

        {/* Lógica de paginación */}
        {paginationData.total > paginationData.limit && (
          <CustomPagination
            page={paginationData.page}
            limit={paginationData.limit}
            total={paginationData.total}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* Panel de Filtros Absoluto */}
      <div
        className={`absolute top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${
          isFilterVisible ? "translate-x-0" : "-translate-x-full"
        } w-full md:w-[400px]`}
      >
        <Filters
          onClose={() => setIsFilterVisible(false)}
          onApply={(f) => {
            setActiveFilters(f);
            setPaginationData((prev) => ({ ...prev, page: 1 })); // Resetear paginación
          }}
        />
      </div>

      {/* Modal de Tesis (Crear o Editar) */}
      {isTesisFormVisible ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background bg-opacity-50 backdrop-blur-sm">
          <TesisForm
            ref={tesisFormRef}
            onClose={handleCloseModal}
            onSuccess={handleSuccessModal}
            tesisToEdit={tesisToEdit}
          />
        </div>
      ) : null}

      {/* Modal de Descarga */}
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
