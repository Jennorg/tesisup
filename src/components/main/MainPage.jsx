import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
import axios from "axios";
import TesisForm from "@/components/main/Form/ManagementForm.jsx"; // Tu alias para ManagementForm
import Header from "@/components/main/Layout/Header";
import Filters from "@/components/main/Layout/Filters";
import CustomPagination from "@/components/Ui/Pagination"; // Importado para la paginación

const MainPage = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [reloadTesisKey, setReloadTesisKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Añadido para la nueva lógica
  const tesisFormRef = useRef(null);

  // Estado para la paginación (de la nueva lógica)
  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 9,
    total: 0,
  });

  // Estado para guardar la tesis que se va a editar
  const [tesisToEdit, setTesisToEdit] = useState(null);

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
  useEffect(() => {
    const fetchTesis = async () => {
      setIsLoading(true);
      setHaBuscado(true);

      try {
        const params = new URLSearchParams({
          page: paginationData.page,
          limit: paginationData.limit,
        });

        if (activeFilters) {
          Object.entries(activeFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              params.append(key, value);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchTesis();
  }, [
    paginationData.page,
    paginationData.limit,
    searchQuery,
    activeFilters,
    reloadTesisKey,
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

  // --- FUNCIÓN DE DESCARGA AÑADIDA ---
  // Esta es la función de tu código "viejo"
  const handleDownloadAll = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/tesis/download/all`;

      const response = await axios.get(apiUrl, {
        responseType: "blob",
        withCredentials: true,
      });

      const blob = response.data;
      const contentType = response.headers["content-type"];

      const isZip = contentType && contentType.includes("application/zip");
      const firstBytes = await blob.slice(0, 2).text();

      if (!isZip || firstBytes !== "PK") {
        const text = await blob.text();
        console.error("Error: La respuesta no es un archivo ZIP válido.", text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || "Error al descargar las tesis");
        } catch (parseError) {
          throw new Error(
            "Respuesta inesperada del servidor: " + text.substring(0, 200)
          );
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
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute("download", filename);

      // Simular clic para iniciar la descarga y luego limpiar
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Descarga completada exitosamente");
    } catch (error) {
      console.error("Error al descargar las tesis:", error);
      alert(error.message || "Error al descargar las tesis");
    }
  };

  // Handler para la paginación
  const handlePageChange = (newPage) => {
    setPaginationData((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="flex flex-col h-dvh">
      <Header
        isAsideVisible={isAsideVisible}
        onToggleMenu={setIsAsideVisible}
        setIsLoading={setIsLoading}
        setHaBuscado={setHaBuscado}
        isFilterVisible={isFilterVisible}
        onToggleFilter={setIsFilterVisible}
        setPaginationData={setPaginationData} // Prop para la nueva lógica
        setSearchQuery={setSearchQuery} // Prop para la nueva lógica
      />
      <main
        className={`relative z-10 flex-grow pr-4 pt-4 overflow-y-auto transition-all duration-300 ${
          isAsideVisible ? "pl-32" : "pl-4"
        }`}
      >
        {/* --- H1 Y BOTÓN DE DESCARGA AÑADIDOS --- */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-text-primary">
            Gestión de Tesis
          </h1>
          <button
            onClick={handleDownloadAll}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
          >
            Descargar tesis
          </button>
        </div>

        <Content
          isAsideVisible={isAsideVisible}
          isTesisFormVisible={isTesisFormVisible}
          setIsTesisFormVisible={setIsTesisFormVisible} // Para el botón "Añadir"
          isLoading={isLoading}
          tesisEncontradas={tesisEncontradas}
          haBuscado={haBuscado}
          onEditTesis={handleEditTesis}
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
        }`}
        style={{ width: "300px" }}
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
    </div>
  );
};

export default MainPage;
