import React from "react";
import formatDate from "@/hooks/utils/formatDate";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";

const Card = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col w-full gap-2 animate-pulse border-gray-800 border-2 p-4 rounded-lg h-full">
        <Skeleton variant="text" width="60%" height={32} />
        <div className="space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="75%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="65%" />
        </div>
        <div className="flex gap-2 mt-auto">
          <Skeleton variant="rectangular" width={120} height={36} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col border-2 border-primary rounded-lg p-4 w-full gap-3 h-full"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-white line-clamp-2">{data.nombre}</h2>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="bg-gray-600 px-3 py-1 rounded-full text-white text-sm">
          {data.estado}
        </span>
        <span className="text-gray-400 text-sm">{formatDate(data.fecha)}</span>
        <span className="text-gray-400 text-sm">{data.sede}</span>
      </div>

      <div className="space-y-1 flex-1">
        <p className="text-sm">
          <span className="text-gray-400">Autor:</span> 
          <span className="text-white ml-1">{data.autor}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-400">Encargado:</span> 
          <span className="text-white ml-1">{data.encargado}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-400">Tutor:</span> 
          <span className="text-white ml-1">{data.tutor}</span>
        </p>
      </div>

      <div className="flex gap-2 mt-auto">
        <Button
          variant="outlined"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
          }}
          sx={{
            color: '#EF4444',
            borderColor: '#EF4444',
            '&:hover': {
              borderColor: '#DC2626',
              bgcolor: 'rgba(239, 68, 68, 0.1)',
            }
          }}
        >
          Eliminar
        </Button>

        <Button
          variant="contained"
          size="small"
          endIcon={<DownloadIcon />}
          onClick={(e) => {
            e.stopPropagation();
            console.log("Descargar tesis:", data.nombre);
          }}
          sx={{
            bgcolor: '#3B82F6',
            '&:hover': {
              bgcolor: '#2563EB',
            }
          }}
        >
          Descargar
        </Button>
      </div>
    </div>
  );
};

export default Card;