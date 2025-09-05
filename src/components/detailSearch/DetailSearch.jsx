import React from "react";
import { useState, useRef } from "react";
import Aside from "@/components/detailSearch/Layout/Aside";
import Header from "@/components/main/Layout/Header";
import Content from "@/components/main/Layout/Content";
import { Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

const DetailSearch = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [isTesisFormVisible, setIsTesisFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tesisEncontradas, setTesisEncontradas] = useState([]);
  const [haBuscado, setHaBuscado] = useState(false);
  const tesisFormRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleAside = () => {
    setIsAsideVisible(!isAsideVisible);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      {/* Mobile Filter Button */}
      {isMobile && (
        <div className="p-4 border-b border-gray-700">
          <IconButton
            onClick={toggleAside}
            sx={{
              color: 'white',
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.2)',
              }
            }}
          >
            <FilterListIcon />
          </IconButton>
          <span className="ml-2 text-white">Filtros</span>
        </div>
      )}

      <div className="flex">
        {/* Desktop Aside */}
        {!isMobile && (
          <div className="w-80 flex-shrink-0">
            <Aside />
          </div>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={isAsideVisible}
            onClose={toggleAside}
            sx={{
              '& .MuiDrawer-paper': {
                width: 320,
                bgcolor: 'rgba(31, 41, 55, 0.95)',
                backdropFilter: 'blur(10px)',
                border: 'none',
              },
            }}
          >
            <Aside onClose={toggleAside} />
          </Drawer>
        )}

        {/* Content */}
        <div className={`flex-1 ${!isMobile ? 'ml-0' : ''}`}>
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
    </div>
  );
};

export default DetailSearch;
