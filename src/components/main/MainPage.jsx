import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
import axios from "axios";
import TesisForm from "@/components/main/Form/ManagementForm.jsx"; // Tu alias para ManagementForm
import Header from "@/components/main/Layout/Header";
import Filters from "@/components/main/Layout/Filters";

const MainPage = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [reloadTesisKey, setReloadTesisKey] = useState(0);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const tesisFormRef = useRef(null);

  // Estado para guardar la tesis que se va a editar
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
        setTesisToEdit(null); // Limpiar estado al cerrar
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTesisFormVisible]);

  // Función para manejar el clic de "Editar"
  const handleEditTesis = (tesisData) => {
    setTesisToEdit(tesisData);
    setIsTesisFormVisible(true);
  };

  // Funciones de cierre y éxito actualizadas
  const handleCloseModal = () => {
    setIsTesisFormVisible(false);
    setTesisToEdit(null); // Limpiar estado
  };

  const handleSuccessModal = () => {
    setReloadTesisKey((k) => k + 1); // Recargar la lista
    setIsTesisFormVisible(false);
    setTesisToEdit(null); // Limpiar estado
  };

  // Función para descargar todas las tesis
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

  return (
    <div className="flex flex-col h-dvh">
      <Header
        isAsideVisible={isAsideVisible}
        onToggleMenu={setIsAsideVisible}
        setIsLoading={setIsLoading}
        tesisEncontradas={tesisEncontradas}
        setTesisEncontradas={setTesisEncontradas}
        setHaBuscado={setHaBuscado}
        isFilterVisible={isFilterVisible}
        onToggleFilter={setIsFilterVisible}
      />
      <main
        className={`relative z-10 flex-grow pr-4 pt-4 overflow-y-auto transition-all duration-300 ${
          isAsideVisible ? "pl-32" : "pl-4"
        }`}
      >
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
          setIsTesisFormVisible={setIsTesisFormVisible}
          isLoading={isLoading}
          tesisEncontradas={tesisEncontradas}
          haBuscado={haBuscado}
          reloadKey={reloadTesisKey}
          filters={activeFilters}
          onEditTesis={handleEditTesis} // Pasar el handler a Content
        />
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
          onApply={(f) => setActiveFilters(f)}
        />
      </div>

      {/* Modal de Tesis (Crear o Editar) */}
      {isTesisFormVisible ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background bg-opacity-50 backdrop-blur-sm">
          <TesisForm
            ref={tesisFormRef}
            onClose={handleCloseModal} // Usar handler actualizado
            onSuccess={handleSuccessModal} // Usar handler actualizado
            tesisToEdit={tesisToEdit} // Pasar los datos de la tesis a editar
          />
        </div>
      ) : null}
    </div>
  );
};

export default MainPage;
