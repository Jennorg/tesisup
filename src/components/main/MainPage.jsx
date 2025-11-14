import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
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