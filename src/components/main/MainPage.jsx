import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
import TesisForm from "@/components/main/Form/TesisForm";
import Header from "@/components/main/Layout/Header";

const MainPage = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [haBuscado, setHaBuscado] = useState(false);
  const tesisFormRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isTesisFormVisible &&
        tesisFormRef.current &&
        !tesisFormRef.current.contains(event.target)
      ) {
        setIsTesisFormVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTesisFormVisible]);

  return (
    <div className="flex flex-col h-dvh m-3">
      <Header
        isAsideVisible={isAsideVisible}
        onToggleMenu={setIsAsideVisible}
        setIsLoading={setIsLoading}
        tesisEncontradas={tesisEncontradas}
        setTesisEncontradas={setTesisEncontradas}
        setHaBuscado={setHaBuscado}
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
        />
      </main>

      {isTesisFormVisible ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background bg-opacity-50 backdrop-blur-sm"
          onClick={(event) => {
            if (
              tesisFormRef.current &&
              !tesisFormRef.current.contains(event.target)
            ) {
              setIsTesisFormVisible(false);
            }
          }}
        >
          <TesisForm ref={tesisFormRef} />
        </div>
      ) : null}
    </div>
  );
};

export default MainPage;