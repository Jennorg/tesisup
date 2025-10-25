import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
import TesisForm from "@/components/main/Form/tesisForm";
import Header from "@/components/main/Layout/Header";
import Filters from "@/components/main/Layout/Filters";

const MainPage = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [reloadTesisKey, setReloadTesisKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [haBuscado, setHaBuscado] = useState(false);
  const tesisFormRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideForm =
        tesisFormRef.current && tesisFormRef.current.contains(event.target);
      const isClickOnDropdown = event.target.closest(".MuiMenu-root");
      const isClickOnDatePicker = event.target.closest(
        ".MuiPickersPopper-root"
      );

      if (
        isTesisFormVisible &&
        !isClickInsideForm &&
        !isClickOnDropdown &&
        !isClickOnDatePicker
      ) {
        setIsTesisFormVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTesisFormVisible]);

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
        />
      </main>
      {/* Panel de Filtros Absoluto */}
      <div
        className={`absolute top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${
          isFilterVisible ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "300px" }}
      >
        <Filters onClose={() => setIsFilterVisible(false)} />
      </div>

      {isTesisFormVisible ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background bg-opacity-50 backdrop-blur-sm">
          <TesisForm
            ref={tesisFormRef}
            onClose={() => setIsTesisFormVisible(false)}
            onSuccess={() => setReloadTesisKey((k) => k + 1)}
          />
        </div>
      ) : null}
    </div>
  );
}; 

export default MainPage;
