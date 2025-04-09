import React, { useState, useEffect, useRef } from "react";
import Content from "@/components/main/Layout/Content";
import TesisForm from "@/components/main/Form/TesisForm";
import Header from "@/components/main/Layout/Header";

const MainPage = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const tesisFormRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTesisFormVisible && tesisFormRef.current && !tesisFormRef.current.contains(event.target)) {
        setIsTesisFormVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTesisFormVisible]);

  return (
    <div className="flex flex-col h-dvh m-3">
      <Header isAsideVisible={isAsideVisible} onToggleMenu={setIsAsideVisible} />
      <Content
        isAsideVisible={isAsideVisible}
        isTesisFormVisible={isTesisFormVisible}
        setIsTesisFormVisible={setIsTesisFormVisible}
      />
      {isTesisFormVisible ? (
        <div
          className="absolute top-0 left-0 grid place-items-center h-full w-full bg-background bg-opacity-50 backdrop-blur-sm"
          onClick={(event) => {
            if (tesisFormRef.current && !tesisFormRef.current.contains(event.target)) {
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