import React, { useState, useEffect, useCallback, forwardRef, useRef } from "react";
import axios from "axios";
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
    // Campos para crear nuevo tutor
    nuevo_tutor_cedula: "",
    nuevo_tutor_nombre: "",
    nuevo_tutor_apellido: "",
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
  const NUEVO_ITEM_VALUE = "new";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newState = { ...prev, [name]: value };

      // Limpiar campos si se cambia de "Crear Nuevo" a una selección existente
      if (name === "id_tutor" && value !== NUEVO_ITEM_VALUE) {
        newState.nuevo_tutor_cedula = "";
        newState.nuevo_tutor_nombre = "";
        newState.nuevo_tutor_apellido = "";
      }

      return newState;
    });
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
    setIsLoading(true);
    setModalState({ isOpen: true, status: "loading", message: "Enviando tesis..." });
    const datos = new FormData();

    Object.keys(formData).forEach((key) => {
      if (
        key.startsWith("nuevo_tutor_") &&
        formData.id_tutor !== NUEVO_ITEM_VALUE
      )
        return;

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
      // On success: show success modal, then clear form and close (handled on modal close)
      setModalState({ isOpen: true, status: "success", message: "Tesis subida correctamente" });

      if (formData.id_tutor === NUEVO_ITEM_VALUE) {
        loadFormOptions();
      }
    } catch (err) {
      console.error("Error al enviar:", err.response?.data || err.message);
      // Show error modal but keep form as-is so user can edit
      setModalState({ isOpen: true, status: "error", message: err.response?.data?.message || "Error al subir la tesis" });
    }

    setIsLoading(false);
  };

  const clearForm = () => {
    setFormData(initialFormData);
    // Clear file input DOM value if present
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch (e) {
        // ignore
      }
    }
  };

  const handleModalClose = () => {
    // Called by LoadingModal after success/error display timeout
    if (modalState.status === "success") {
      // clear form and request parent to close the form overlay (if provided)
      clearForm();
      props.onSuccess?.();
      props.onClose?.();
    }

    // Always close the modal
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
          width: "90%",
          mx: "auto",
        }}
      >
        <h1 className="text-2xl font-bold text-center mb-4">
          Formulario de Tesis
        </h1>

        <div className="flex flex-col gap-4 overflow-y-scroll max-h-[80vh] pr-2">
          <FormControl variant="filled" fullWidth>
            <InputLabel id="modo-envio-label">
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
              ref={fileInputRef}
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

          <TextField
            fullWidth
            label="Título de la Tesis"
            name="nombre"
            variant="filled"
            value={formData.nombre}
            onChange={handleInputChange}
          />

          <FormControl variant="filled" fullWidth>
            <InputLabel id="estudiante-label">Autor/Estudiante</InputLabel>
            <Select
              labelId="estudiante-label"
              id="estudiante-select"
              name="id_estudiante"
              value={formData.id_estudiante}
              onChange={handleInputChange}
            >
              {dropdownOptions.estudiantes.length === 0 ? (
                <MenuItem disabled>No hay estudiantes registrados</MenuItem>
              ) : (
                dropdownOptions.estudiantes.map((estudiante) => (
                  <MenuItem key={estudiante.ci} value={String(estudiante.ci)}>
                    {estudiante.nombre_completo || estudiante.nombre}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl variant="filled" fullWidth>
            <InputLabel id="tutor-label">Tutor</InputLabel>
            <Select
              labelId="tutor-label"
              id="tutor-select"
              name="id_tutor"
              value={formData.id_tutor}
              onChange={handleInputChange}
            >
              {dropdownOptions.profesores.length === 0 ? (
                <MenuItem disabled>No hay profesores registrados</MenuItem>
              ) : (
                dropdownOptions.profesores.map((profesore) => (
                  <MenuItem key={profesore.ci} value={String(profesore.ci)}>
                    {profesore.nombre_completo || profesore.nombre}
                  </MenuItem>
                ))
              )}
              <MenuItem key="new-tutor" value={NUEVO_ITEM_VALUE}>
                <span style={{ fontStyle: "italic", color: "grey" }}>
                  Crear Nuevo Tutor...
                </span>
              </MenuItem>
            </Select>
          </FormControl>
          {formData.id_tutor === NUEVO_ITEM_VALUE && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: -2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nuevo_tutor_nombre"
                  variant="filled"
                  value={formData.nuevo_tutor_nombre}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Apellido"
                  name="nuevo_tutor_apellido"
                  variant="filled"
                  value={formData.nuevo_tutor_apellido}
                  onChange={handleInputChange}
                  required
                />
              </Box>
              <TextField
                fullWidth
                label="Cédula"
                name="nuevo_tutor_cedula"
                variant="filled"
                value={formData.nuevo_tutor_cedula}
                onChange={handleInputChange}
                required
              />
            </Box>
          )}

          <FormControl variant="filled" fullWidth>
            <InputLabel id="encargado-label">Encargado</InputLabel>
            <Select
              labelId="encargado-label"
              id="encargado-select"
              name="id_encargado"
              value={formData.id_encargado}
              onChange={handleInputChange}
            >
              {dropdownOptions.encargados.length === 0 ? (
                <MenuItem disabled>No hay encargados registrados</MenuItem>
              ) : (
                dropdownOptions.encargados.map((encargado) => (
                  <MenuItem key={encargado.ci} value={String(encargado.ci)}>
                    {encargado.nombre_completo || encargado.nombre}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl variant="filled" fullWidth>
            <InputLabel id="sede-label">Sede</InputLabel>
            <Select
              labelId="sede-label"
              id="sede-select"
              name="id_sede"
              value={formData.id_sede}
              onChange={handleInputChange}
            >
              {dropdownOptions.sedes.map((sede) => (
                <MenuItem key={sede.id} value={sede.id}>
                  {sede.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="Fecha de aprobación"
            format="DD/MM/YYYY"
            value={formData.fecha}
            onChange={handleDateChange}
            slotProps={{
              popper: {
                onMouseDown: (e) => e.stopPropagation(),
              },
              textField: { variant: "filled", fullWidth: true },
            }}
          />

          <FormControl variant="filled" fullWidth>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select
              labelId="estado-label"
              id="estado-select"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
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
