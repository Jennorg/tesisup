import React from "react";
import { useState, useRef } from "react";
import Aside from "@/components/detailSearch/Layout/Aside";
import Header from "@/components/main/Layout/Header";
import Content from "@/components/main/Layout/Content";

const DetailSearch = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [haBuscado, setHaBuscado] = useState(false);
  const tesisFormRef = useRef(null);

  return (
    <div>
      <Header />
      <div className="flex">
        <Aside />
        <Content
          isAsideVisible={isAsideVisible}
          isTesisFormVisible={isTesisFormVisible}
          setIsTesisFormVisible={setIsTesisFormVisible}
          isLoading={isLoading}
          tesisEncontradas={tesisEncontradas}
          haBuscado={haBuscado}
        />
      </div>
    </div>
  );
};

export default DetailSearch;
