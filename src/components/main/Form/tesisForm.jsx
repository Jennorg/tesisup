import React, { useState, useEffect } from "react";
import axios from "axios";
import InputForm from "@/components/main/Form/inputForm";

import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const TesisForm = React.forwardRef((props, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_tesis: "",
    nombre: "",
    id_estudiante: "",
    id_tutor: "",
    id_encargado: "",
    fecha: "",
    id_sede: "",
    estado: "",
    archivo_pdf: null,
    modo_envio: "normal",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    profesores: [],
    encargados: [],
    sedes: [],
    estudiantes: [],
  });

  const estados = ["Aprobada", "Rechazada", "Pendiente"];

  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        const [profesoresRes, encargadosRes, sedesRes, estudiantesRes] =
          await Promise.all([
            axios.get("http://localhost:8080/api/profesor"),
            axios.get("http://localhost:8080/api/encargado"),
            axios.get("http://localhost:8080/api/sede"),
            axios.get("http://localhost:8080/api/estudiantes"),
          ]);

        setDropdownOptions({
          profesores: profesoresRes.data.data || [],
          encargados: encargadosRes.data.data || [],
          sedes: sedesRes.data.data || [],
          estudiantes: estudiantesRes.data.data || [],
        });
      } catch (error) {
        console.error("Error al cargar opciones:", error);
        setDropdownOptions({
          profesores: [],
          encargados: [],
          sedes: [],
          estudiantes: [],
        });
      }
    };

    loadFormOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, archivo_pdf: e.target.files[0] }));
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
    setFormData((prev) => ({ ...prev, archivo_pdf: e.dataTransfer.files[0] }));
  };
  const sendForm = async () => {
    setIsLoading(true);

    if (!formData.id_tesis) {
      alert("Debes ingresar un ID para la tesis.");
      setIsLoading(false);
      return;
    }

    const datos = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "archivo_pdf") {
        datos.append("archivo", formData[key]);
      } else {
        datos.append(key, formData[key]);
      }
    });

    const endpoint =
      formData.modo_envio === "digitalizar"
        ? "http://localhost:8080/api/tesis/digital"
        : "http://localhost:8080/api/tesis";

    try {
      const res = await axios.post(endpoint, datos, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(res.data);
    } catch (err) {
      console.error("Error al enviar:", err);
    }

    setIsLoading(false);
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        ref={ref}
        sx={{
          bgcolor: "background.paper", // Usa el color de fondo del tema
          color: "text.primary", // Usa el color de texto del tema
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
          maxWidth: "600px",
          width: "90%",
        }}
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          Formulario de Tesis
        </h1>

        <div className="flex flex-col gap-4">
          <FormControl variant="filled" fullWidth>
            <InputLabel id="autor-label">
              ¿Cómo desea subir la tesis?
            </InputLabel>
            <Select
              labelId="modo-envio-label"
              id="modo-envio-select"
              name="modo_envio"
              value={formData.modo_envio}
              onChange={handleInputChange}
            >
              <MenuItem value="normal">Subir archivo PDF</MenuItem>
              <MenuItem value="digitalizar">
                Escanear imagen y convertir a PDF
              </MenuItem>
            </Select>
          </FormControl>

          <Box
            component="label"
            htmlFor="file-upload"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEvents}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: "2px dashed",
              borderColor: isDragging ? "primary.main" : "grey.400",
              borderRadius: 1,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.3s, background-color 0.3s",
              backgroundColor: isDragging ? "action.hover" : "transparent",
            }}
          >
            <VisuallyHiddenInput
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept={
                formData.modo_envio === "digitalizar"
                  ? "image/*"
                  : "application/pdf"
              }
            />
            <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
            <p>
              {formData.archivo_pdf?.name ||
                "Arrastra un archivo o haz clic para subir"}
            </p>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
              marginBottom: 2,
            }}
          >
            {/* <PersonOutlineOutlinedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          /> */}
            <TextField
              fullWidth
              label="Titulo"
              name="titulo"
              variant="standard"
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
              marginBottom: 2,
            }}
          >
            {/* <PersonOutlineOutlinedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          /> */}
            <TextField
              fullWidth
              label="Autor"
              name="autor"
              variant="standard"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
              marginBottom: 2,
            }}
          >
            {/* <PersonOutlineOutlinedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          /> */}
            <TextField
              fullWidth
              label="Tutor"
              name="tutor"
              variant="standard"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
              marginBottom: 2,
            }}
          >
            {/* <PersonOutlineOutlinedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          /> */}
            <TextField
              fullWidth
              label="Encargado"
              name="encargado"
              variant="standard"
            />
          </Box>

          <DatePicker
            label="Fecha de aprobaciòn"
            format="DD/MM/YYYY"
            slotProps={{ textField: { variant: "filled", fullWidth: true } }}
          />

          <FormControl variant="filled" fullWidth>
            <InputLabel id="autor-label">Estado</InputLabel>
            <Select labelId="autor-label" id="autor-select" name="estado">
              {estados.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <button
            type="button"
            className="col-span-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            disabled={isLoading}
            onClick={sendForm}
          >
            {isLoading
              ? formData.modo_envio === "digitalizar"
                ? "Digitalizando..."
                : "Enviando..."
              : formData.modo_envio === "digitalizar"
              ? "Digitalizar tesis"
              : "Subir PDF"}
          </button>
        </div>
      </Box>
    </LocalizationProvider>
  );
});

export default TesisForm;
