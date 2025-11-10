import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useRef,
} from "react";
import axios from "axios";
import {
  Autocomplete,
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
import dayjs from "dayjs";
import LoadingModal from "@/hooks/Modals/LoadingModal";

const API_URL = import.meta.env.VITE_API_URL;
const VITE_API_URL = API_URL || "http://localhost:8080/api";

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

const TesisForm = forwardRef((props, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const initialFormData = {
    id_tesis: "",
    nombre: "",
    id_estudiante: "",
    id_tutor: "",
    id_encargado: "",
    fecha: null,
    id_sede: "",
    estado: "",
    archivo_pdf: null,
    modo_envio: "normal",
  };

  const [formData, setFormData] = useState(initialFormData);

  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    profesores: [],
    encargados: [],
    sedes: [],
    estudiantes: [],
  });

  const estados = ["Aprobado", "Rechazado", "Pendiente", "en revisión"];

  const loadFormOptions = useCallback(async () => {
    try {
      const [profesoresRes, encargadosRes, sedesRes, estudiantesRes] =
        await Promise.all([
          axios.get(`${VITE_API_URL}/profesor`),
          axios.get(`${VITE_API_URL}/encargado`),
          axios.get(`${VITE_API_URL}/sede`),
          axios.get(`${VITE_API_URL}/estudiantes`),
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
  }, []);

  useEffect(() => {
    loadFormOptions();
  }, [loadFormOptions]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      fecha: date,
    }));
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
    const requiredFields = [
      "nombre",
      "id_estudiante",
      "id_tutor",
      "id_encargado",
      "fecha",
      "id_sede",
      "estado",
      "archivo_pdf",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setModalState({
          isOpen: true,
          status: "error",
          message: "Por favor, rellene todos los campos",
        });
        return;
      }
    }

    setIsLoading(true);
    setModalState({
      isOpen: true,
      status: "loading",
      message: "Enviando tesis...",
    });
    const datos = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "archivo_pdf") {
        if (formData[key]) datos.append("archivo_pdf", formData[key]);
      } else if (key === "fecha" && formData[key]) {
        datos.append("fecha", dayjs(formData[key]).format("YYYY-MM-DD"));
      } else if (formData[key] !== null && formData[key] !== "") {
        datos.append(key, formData[key]);
      }
    });

    const endpoint =
      formData.modo_envio === "digitalizar"
        ? `${VITE_API_URL}/tesis/digital`
        : `${VITE_API_URL}/tesis`;

    try {
      console.log("Datos a enviar:", Object.fromEntries(datos.entries()));
      const res = await axios.post(endpoint, datos, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(res.data);
      setModalState({
        isOpen: true,
        status: "success",
        message: "Tesis subida correctamente",
      });

      loadFormOptions();
    } catch (err) {
      console.error(
        "Error al enviar:",
        err.response?.data?.error || err.message
      );
      setModalState({
        isOpen: true,
        status: "error",
        message: err.response?.data?.error || "Error al subir la tesis",
      });
    }

    setIsLoading(false);
  };

  const clearForm = () => {
    setFormData(initialFormData);
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch (e) {}
    }
  };

  const handleModalClose = () => {
    if (modalState.status === "success") {
      clearForm();
      props.onSuccess?.();
      props.onClose?.();
    }
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        ref={ref}
        onSubmit={(e) => e.preventDefault()}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
          maxWidth: "600px",
          width: "95%",
          mx: "auto",
          // Estilos para móvil (por defecto)
          maxHeight: "90vh",
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: 2,
        }}
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          Formulario de Tesis
        </h1>

        <div
          className="
            flex flex-col gap-3 overflow-y-auto flex-grow 
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-400"
        >
          {/* <FormControl variant="filled" fullWidth>
            <InputLabel id="modo-envio-label">
              ¿Cómo desea subir la tesis?
            </InputLabel>
            <Select
              labelId="modo-envio-label"
              id="modo-envio-select"
              name="modo_envio"
              value={formData.modo_envio}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              disablePortal
            >
              <MenuItem value="normal">Subir archivo PDF</MenuItem>
              <MenuItem value="digitalizar">
                Escanear imagen y convertir a PDF
              </MenuItem>
            </Select>
          </FormControl> */}

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
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept={
                formData.modo_envio === "digitalizar"
                  ? "image/*"
                  : "application/pdf"
              }
              required
            />
            <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
            <p>
              {formData.archivo_pdf?.name ||
                "Arrastra un archivo o haz clic para subir"}
            </p>
          </Box>

          <TextField
            fullWidth
            label="Título de la Tesis"
            name="nombre"
            variant="filled"
            value={formData.nombre}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            required
          />

          <Autocomplete
            id="estudiante-select"
            options={dropdownOptions.estudiantes}
            getOptionLabel={(option) => option.nombre_completo || option.nombre}
            value={
              dropdownOptions.estudiantes.find(
                (e) => String(e.ci) === formData.id_estudiante
              ) || null
            }
            onChange={(event, newValue) => {
              handleInputChange(
                "id_estudiante",
                newValue ? String(newValue.ci) : ""
              );
            }}
            disablePortal
            renderInput={(params) => (
              <TextField
                {...params}
                label="Autor/Estudiante"
                variant="filled"
                fullWidth
                required
              />
            )}
            noOptionsText="No hay estudiantes registrados"
          />

          <Autocomplete
            id="tutor-select"
            options={dropdownOptions.profesores}
            getOptionLabel={(option) => option.nombre_completo || option.nombre}
            value={
              dropdownOptions.profesores.find(
                (p) => String(p.ci) === formData.id_tutor
              ) || null
            }
            onChange={(event, newValue) => {
              handleInputChange(
                "id_tutor",
                newValue ? String(newValue.ci) : ""
              );
            }}
            disablePortal
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tutor"
                variant="filled"
                fullWidth
                required
              />
            )}
            noOptionsText="No hay profesores registrados"
          />

          <Autocomplete
            id="encargado-select"
            options={dropdownOptions.encargados}
            getOptionLabel={(option) => option.nombre_completo || option.nombre}
            value={
              dropdownOptions.encargados.find(
                (e) => String(e.ci) === formData.id_encargado
              ) || null
            }
            onChange={(event, newValue) => {
              handleInputChange(
                "id_encargado",
                newValue ? String(newValue.ci) : ""
              );
            }}
            disablePortal
            renderInput={(params) => (
              <TextField
                {...params}
                label="Encargado"
                variant="filled"
                fullWidth
                required
              />
            )}
            noOptionsText="No hay encargados registrados"
          />

          <Autocomplete
            id="sede-select"
            options={dropdownOptions.sedes}
            getOptionLabel={(option) => option.nombre}
            value={
              dropdownOptions.sedes.find((s) => s.id === formData.id_sede) ||
              null
            }
            onChange={(event, newValue) => {
              handleInputChange("id_sede", newValue ? newValue.id : "");
            }}
            disablePortal
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sede"
                variant="filled"
                fullWidth
                required
              />
            )}
            noOptionsText="No hay sedes registradas"
          />

          <DatePicker
            label="Fecha de aprobación"
            format="DD/MM/YYYY"
            value={formData.fecha}
            onChange={handleDateChange}
            slotProps={{
              popper: { disablePortal: true },
              textField: { variant: "filled", fullWidth: true, required: true },
            }}
          />

          <FormControl variant="filled" fullWidth required>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select
              labelId="estado-label"
              id="estado-select"
              name="estado"
              value={formData.estado}
              onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              disablePortal
            >
              {estados.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type="button"
            variant="contained"
            color="primary"
            fullWidth
            onClick={sendForm}
            disabled={isLoading}
            sx={{ py: 2, mt: 1 }}
          >
            {isLoading
              ? formData.modo_envio === "digitalizar"
                ? "Digitalizando..."
                : "Enviando..."
              : formData.modo_envio === "digitalizar"
              ? "Digitalizar Tesis"
              : "Subir PDF"}
          </Button>
        </div>
      </Box>
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleModalClose}
      />
    </LocalizationProvider>
  );
});

export default TesisForm;
