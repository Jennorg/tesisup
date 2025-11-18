import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
import axios from "axios";
import TesisForm from "@/components/main/Form/ManagementForm.jsx";
import Header from "@/components/main/Layout/Header";
import Filters from "@/components/main/Layout/Filters";
import CustomPagination from "@/components/Ui/Pagination";

const MainPage = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [reloadTesisKey, setReloadTesisKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null); // Nuevo estado para el error
  const tesisFormRef = useRef(null);

  const [paginationData, setPaginationData] = useState({
    page: 1,
    limit: 9,
    total: 0,
  });

  const [tesisToEdit, setTesisToEdit] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  useEffect(() => {
    const fetchTesis = async () => {
      console.log("=== INICIANDO FETCH TESIS ===");
      console.log("Estado actual - activeFilters:", activeFilters);
      console.log("Estado actual - searchQuery:", searchQuery);
      console.log("Estado actual - paginationData:", paginationData);
      
      setIsLoading(true);
      setHaBuscado(true);
      setError(null); // Limpiar error anterior

      try {
        const params = new URLSearchParams({
          page: paginationData.page,
          limit: paginationData.limit,
        });

        if (activeFilters && typeof activeFilters === 'object') {
          Object.entries(activeFilters).forEach(([key, value]) => {
            // Solo agregar valores válidos (no null, undefined, ni string vacío)
            if (value !== null && value !== undefined && value !== "") {
              // Convertir a string para URLSearchParams
              const stringValue = String(value);
              params.append(key, stringValue);
              console.log(`Agregando filtro: ${key} = ${stringValue} (original: ${value}, tipo: ${typeof value})`);
            } else {
              console.log(`Omitiendo filtro: ${key} = ${value} (valor vacío/null/undefined)`);
            }
          });
        } else {
          console.log("No hay filtros activos o activeFilters no es un objeto válido");
        }

        if (searchQuery) {
          params.append("cadena", searchQuery);
          console.log(`Agregando búsqueda: cadena = ${searchQuery}`);
        }

        const apiUrl = `${import.meta.env.VITE_API_URL}/tesis`;

        console.log("=== SOLICITUD AL BACKEND ===");
        console.log("URL:", apiUrl);
        console.log("Parámetros completos:", params.toString());
        console.log("Filtros activos (objeto):", JSON.stringify(activeFilters, null, 2));
        console.log("Búsqueda:", searchQuery || "(vacía)");
        console.log("============================");

        const response = await axios.get(apiUrl, {
          params,
          withCredentials: true,
        });

        console.log("Respuesta del backend:", response.data);

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
      } catch (err) {
        console.error("Error al buscar tesis:", err);
        setError(err); // Guardar el error en el estado
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

  // Debug: Log cuando cambian las dependencias
  useEffect(() => {
    console.log("🔄 DEPENDENCIAS CAMBIARON:");
    console.log("  - paginationData.page:", paginationData.page);
    console.log("  - paginationData.limit:", paginationData.limit);
    console.log("  - searchQuery:", searchQuery);
    console.log("  - activeFilters:", activeFilters);
    console.log("  - reloadTesisKey:", reloadTesisKey);
  }, [paginationData.page, paginationData.limit, searchQuery, activeFilters, reloadTesisKey]);

  const handleEditTesis = (tesisData) => {
    setTesisToEdit(tesisData);
    setIsTesisFormVisible(true);
  };

  const handleCloseModal = () => {
    setIsTesisFormVisible(false);
    setTesisToEdit(null);
  };

  const handleSuccessModal = () => {
    setReloadTesisKey((k) => k + 1);
    setIsTesisFormVisible(false);
    setTesisToEdit(null);
  };

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
        setPaginationData={setPaginationData}
        setSearchQuery={setSearchQuery}
      />
      <main
        className={`relative z-10 flex-grow pr-4 pt-4 overflow-y-auto transition-all duration-300 ${
          isAsideVisible ? "pl-32" : "pl-4"
        }`}
      >
        <Content
          isAsideVisible={isAsideVisible}
          setIsTesisFormVisible={setIsTesisFormVisible}
          isLoading={isLoading}
          tesisEncontradas={tesisEncontradas}
          haBuscado={haBuscado}
          onEditTesis={handleEditTesis}
          onTesisDeleted={handleSuccessModal} // Pasar la función de recarga
          error={error} // Pasar el estado de error
        />

        {paginationData.total > paginationData.limit && (
          <CustomPagination
            page={paginationData.page}
            limit={paginationData.limit}
            total={paginationData.total}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      <div
        className={`absolute top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${
          isFilterVisible ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "300px" }}
      >
        <Filters
          onClose={() => setIsFilterVisible(false)}
          onApply={(f) => {
            console.log("=== APLICANDO FILTROS ===");
            console.log("Filtros recibidos:", f);
            console.log("Filtros anteriores:", activeFilters);
            // Asegurar que siempre sea un objeto o null, nunca undefined
            const filtersToSet = f === null || f === undefined ? null : f;
            setActiveFilters(filtersToSet);
            // Resetear a página 1 cuando se aplican filtros
            setPaginationData((prev) => ({ ...prev, page: 1 }));
            console.log("Filtros aplicados correctamente:", filtersToSet);
            console.log("========================");
          }}
        />
      </div>

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
