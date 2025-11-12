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
  Chip,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";

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

const getPersonaLabel = (option) => {
  if (typeof option === "string") return option;
  
  // 💡 MODIFICADO: Añadida la opción 'isNew'
  if (option.isNew) {
    return `Crear nuevo: "${option.nombre}"`;
  }

  const nombre = option.nombre_completo || `${option.nombre || ''} ${option.apellido || ''}`.trim() || option.nombre || "";
  const ciType = option.ci_type || "V";
  const ci = option.ci || "";
  if (!ci) return nombre;
  return `${nombre} (CI: ${ciType}-${ci})`;
};

// 💡 1. PROPS ACTUALIZADAS: Recibe 'onRequestCreateUser'
const TesisForm = forwardRef(({ dropdownOptions, onSuccess, onClose, onRequestCreateUser }, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const initialFormData = {
    id_tesis: "",
    nombre: "",
    id_estudiantes: [], 
    id_tutor: "",
    id_encargado: "",
    id_jurados: [], 
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

  // 💡 2. LÓGICA ELIMINADA: 
  // Se eliminaron 'formSubmitted', 'createUserDialog' y 'newUserData'
  // Se eliminó 'handleCreateUser'
  const [formSubmitted, setFormSubmitted] = useState(false);
  const estados = ["Aprobado", "Rechazado", "Pendiente", "en revisión"];

  useEffect(() => {
    if (formData.id_tutor && formData.id_jurados.length > 0) {
      const filteredJurados = formData.id_jurados.filter(
        (ci) => String(ci) !== String(formData.id_tutor)
      );
      if (filteredJurados.length !== formData.id_jurados.length) {
        handleInputChange("id_jurados", filteredJurados);
      }
    }
  }, [formData.id_tutor]);

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

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, archivo_pdf: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    handleDragEvents(e);
    if (!formData.archivo_pdf) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (!formData.archivo_pdf) {
      setFormData((prev) => ({
        ...prev,
        archivo_pdf: e.dataTransfer.files[0],
      }));
    }
  };

  const sendForm = async () => {
    const requiredFields = [
      "nombre",
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
          message: "Por favor, rellene todos los campos obligatorios.",
        });
        return;
      }
    }
    
    if (formData.id_estudiantes.length === 0) {
      setModalState({
        isOpen: true,
        status: "error",
        message: "Debe seleccionar al menos un Autor/Estudiante.",
      });
      return;
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
      } else if (key === "id_estudiantes" && Array.isArray(formData[key])) {
        formData[key].forEach((ci, index) => {
          datos.append(`id_estudiantes[${index}]`, ci);
        });
        if (formData[key].length > 0) {
          datos.append("id_estudiante", formData[key][0]); 
        }
      } else if (key === "id_jurados" && Array.isArray(formData[key])) {
        formData[key].forEach((ci, index) => {
          datos.append(`id_jurados[${index}]`, ci);
        });
        if (formData[key].length > 0) { datos.append("id_jurado_1", formData[key][0]); }
        if (formData[key].length > 1) { datos.append("id_jurado_2", formData[key][1]); }
        if (formData[key].length > 2) { datos.append("id_jurado_3", formData[key][2]); }
      } else if (formData[key] !== null && formData[key] !== "" && !Array.isArray(formData[key])) {
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
      
      setFormSubmitted(true);
      setModalState({
        isOpen: true,
        status: "success",
        message: "Tesis subida correctamente",
      });
    } catch (err) {
      console.error(
        "Error al enviar:",
        err.response?.data?.error || err.message
      );
      setFormSubmitted(false);
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
    if (modalState.status === "success" && formSubmitted) {
      clearForm();
      onSuccess?.();
      onClose?.(); 
    }
    
    setModalState((s) => ({ ...s, isOpen: false }));
    setFormSubmitted(false);
  };

  // 💡 3. FUNCIÓN DE FILTRADO REUTILIZABLE
  const filterOptions = (options, params) => {
    const filtered = options.filter((option) => {
      const label = getPersonaLabel(option).toLowerCase();
      const searchLower = params.inputValue.toLowerCase();
      return (
        label.includes(searchLower) ||
        String(option.ci).includes(searchLower)
      );
    });

    // Añadir la opción de "Crear nuevo" si no hay coincidencias
    if (params.inputValue && filtered.length === 0) {
      filtered.push({
        isNew: true,
        nombre: params.inputValue, // El texto que el usuario escribió
        ci: null, 
      });
    }
    return filtered;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        ref={ref}
        onSubmit={(e) => e.preventDefault()}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          overflowY: "auto", 
          maxHeight: "65vh", 
          p: 1, 
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
        }}
      >
        
        <Box
          component="label"
          htmlFor={
            !formData.archivo_pdf && !isLoading ? "file-upload" : undefined
          }
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEvents}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            position: "relative",
            border: "2px dashed",
            borderColor: isDragging
              ? "primary.main"
              : formData.archivo_pdf
              ? "success.main"
              : "grey.400",
            borderRadius: 1,
            p: 3,
            textAlign: "center",
            cursor: formData.archivo_pdf || isLoading ? "default" : "pointer",
            transition: "border-color 0.3s, background-color 0.3s",
            backgroundColor: isDragging
              ? "action.hover"
              : formData.archivo_pdf
              ? "success.light"
              : "transparent",
            opacity: isLoading ? 0.6 : 1,
            color: formData.archivo_pdf ? "success.dark" : "inherit",
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
            disabled={!!formData.archivo_pdf || isLoading}
          />

          {isLoading ? (
            <>
              <CloudUploadIcon
                sx={{ fontSize: 40, mb: 1, animation: "pulse 1.5s infinite" }}
              />
              <p>Subiendo archivo...</p>
              <p className="text-sm">&nbsp;</p>
            </>
          ) : formData.archivo_pdf ? (
            <>
              <IconButton
                aria-label="remove file"
                onClick={removeFile}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "inherit",
                }}
              >
                <CancelIcon />
              </IconButton>
              <CheckCircleOutlineIcon sx={{ fontSize: 40, mb: 1 }} />
              <p className="truncate max-w-full">
                {formData.archivo_pdf.name}
              </p>
              <p className="text-sm">
                {(formData.archivo_pdf.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
              <p>Arrastra un archivo o haz clic para subir</p>
              <p className="text-sm">Debe ser un archivo .pdf</p>
            </>
          )}
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

        {/* 💡 4. AUTOCOMPLETE DE ESTUDIANTES (ACTUALIZADO) */}
        <Autocomplete
          id="estudiantes-select"
          multiple
          freeSolo
          options={dropdownOptions.estudiantes}
          value={formData.id_estudiantes.map((ci) => {
            const estudiante = dropdownOptions.estudiantes.find(
              (e) => String(e.ci) === String(ci)
            );
            return estudiante || null;
          }).filter(Boolean)}
          filterOptions={filterOptions} // Usa la función de filtro
          getOptionLabel={getPersonaLabel}
          onChange={(event, newValue) => {
            const newOption = newValue.find((v) => v && v.isNew);
            if (newOption) {
              onRequestCreateUser('estudiante', newOption.nombre);
              const existingCis = newValue
                .filter((v) => v && v.ci && !v.isNew) 
                .map((v) => String(v.ci));
              handleInputChange("id_estudiantes", existingCis);
              return;
            }
            const selectedCis = newValue
              .filter((v) => v && v.ci)
              .map((v) => String(v.ci));
            handleInputChange("id_estudiantes", selectedCis);
          }}
          disablePortal
          renderInput={(params) => (
            <TextField
              {...params}
              label="Autores/Estudiantes"
              variant="filled"
              fullWidth
              required
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip
                  key={option.ci || index}
                  label={getPersonaLabel(option)}
                  {...chipProps}
                />
              );
            })
          }
          noOptionsText="Escribe para buscar o crear un estudiante"
        />

        {/* 💡 5. AUTOCOMPLETE DE TUTOR (ACTUALIZADO) */}
        <Autocomplete
          id="tutor-select"
          freeSolo
          options={dropdownOptions.profesores}
          value={
            dropdownOptions.profesores.find(
              (p) => String(p.ci) === formData.id_tutor
            ) || null
          }
          filterOptions={filterOptions}
          getOptionLabel={getPersonaLabel}
          onChange={(event, newValue) => {
            if (newValue && typeof newValue === "object" && newValue.isNew) {
              onRequestCreateUser('profesor', newValue.nombre);
              handleInputChange("id_tutor", ""); 
              return;
            }
            if (newValue && typeof newValue === "object" && newValue.ci) {
              handleInputChange("id_tutor", String(newValue.ci));
            } else {
              handleInputChange("id_tutor", "");
            }
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
          noOptionsText="Escribe para buscar o crear un profesor"
        />

        {/* 💡 6. AUTOCOMPLETE DE ENCARGADO (ACTUALIZADO) */}
        <Autocomplete
          id="encargado-select"
          freeSolo // <-- Añadido
          options={dropdownOptions.encargados}
          getOptionLabel={getPersonaLabel}
          value={
            dropdownOptions.encargados.find(
              (e) => String(e.ci) === formData.id_encargado
            ) || null
          }
          filterOptions={filterOptions} // <-- Añadido
          onChange={(event, newValue) => {
            if (newValue && typeof newValue === "object" && newValue.isNew) {
              onRequestCreateUser('encargado', newValue.nombre);
              handleInputChange("id_encargado", ""); 
              return;
            }
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
          noOptionsText="Escribe para buscar o crear un encargado"
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

        <Autocomplete
          id="jurados-select"
          multiple
          options={dropdownOptions.profesores.filter(
            (p) => String(p.ci) !== formData.id_tutor
          )}
          getOptionLabel={getPersonaLabel}
          value={formData.id_jurados
            .map((ci) => {
              const profesor = dropdownOptions.profesores.find(
                (p) => String(p.ci) === String(ci)
              );
              return profesor || null;
            })
            .filter(Boolean)}
          onChange={(event, newValue) => {
            const limitedValue = newValue.slice(0, 3);
            const selectedCis = limitedValue
              .filter((v) => v && v.ci)
              .map((v) => String(v.ci));
            handleInputChange("id_jurados", selectedCis);
          }}
          disablePortal
          renderInput={(params) => (
            <TextField
              {...params}
              label="Jurados (máximo 3)"
              variant="filled"
              fullWidth
              helperText={`${formData.id_jurados.length}/3 jurados seleccionados. No pueden ser iguales al tutor.`}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip
                  key={option.ci || index}
                  label={getPersonaLabel(option)}
                  {...chipProps}
                />
              );
            })
          }
          noOptionsText="No hay profesores disponibles (excluyendo al tutor)"
          disabled={!formData.id_tutor}
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
      </Box>

      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleModalClose}
      />
      
      {/* 💡 7. ELIMINADO: Todo el JSX de <Dialog> se ha ido */}
    </LocalizationProvider>
  );
});

export default TesisForm;