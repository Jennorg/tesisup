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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Typography,
  Alert,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
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

// 💡 FUNCIÓN AUXILIAR para crear las etiquetas de Persona (Nombre + CI)
const getPersonaLabel = (option) => {
  if (typeof option === "string") return option;
  
  // Manejar la opción "Crear nuevo..."
  if (option.isNew) {
    return `Crear nuevo: "${option.nombre}"`;
  }

  // Formatear el nombre
  const nombre = option.nombre_completo || `${option.nombre || ''} ${option.apellido || ''}`.trim() || option.nombre || "";
  
  // Formatear la Cédula
  const ciType = option.ci_type || "V"; // Asumir "V" si no se provee
  const ci = option.ci || "";

  if (!ci) {
    return nombre; // Retornar solo nombre si no hay CI (ej. opción 'Crear nuevo')
  }

  return `${nombre} (CI: ${ciType}-${ci})`;
};


const TesisForm = forwardRef((props, ref) => {
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

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [createUserDialog, setCreateUserDialog] = useState({
    open: false,
    type: null,
    inputValue: "",
  });

  const [newUserData, setNewUserData] = useState({
    nombre: "",
    apellido: "",
    ci: "",
    ci_type: "V",
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

  const handleCreateUser = async () => {
    const { type } = createUserDialog;
    const endpoint = type === "estudiante" ? "estudiantes" : "profesor";
    
    setModalState({
      isOpen: true,
      status: "loading",
      message: `Creando ${type === "estudiante" ? "estudiante" : "profesor"}...`,
    });

    try {
      const defaultEmail = `${newUserData.nombre.toLowerCase().replace(/\s+/g, '')}.${newUserData.apellido.toLowerCase().replace(/\s+/g, '')}@uneg.edu.ve`;
      const defaultTelefono = "00000000000";
      const defaultPassword = `${newUserData.ci_type}${newUserData.ci}`; 

      const payload = {
        ...newUserData,
        ci: parseInt(newUserData.ci),
        ci_type: String(newUserData.ci_type || "V"),
        nombre: String(newUserData.nombre),
        apellido: String(newUserData.apellido),
        email: String(defaultEmail),
        telefono: String(defaultTelefono),
        password: String(defaultPassword),
      };

      const res = await axios.post(`${VITE_API_URL}/${endpoint}`, payload);
      
      await loadFormOptions();
      
      const newUser = res.data.data || res.data;
      
      if (type === "estudiante") {
        setFormData((prev) => ({
          ...prev,
          id_estudiantes: [...prev.id_estudiantes, String(newUser.ci)],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          id_tutor: String(newUser.ci),
        }));
      }

      setFormSubmitted(false); 
      setModalState({
        isOpen: true,
        status: "success",
        message: `${type === "estudiante" ? "Estudiante" : "Profesor"} creado correctamente`,
      });

      setCreateUserDialog({ open: false, type: null, inputValue: "" });
      setNewUserData({
        nombre: "",
        apellido: "",
        ci: "",
        ci_type: "V",
      });
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setFormSubmitted(false);
      setModalState({
        isOpen: true,
        status: "error",
        message: err.response?.data?.error || `Error al crear ${type}`,
      });
    }
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

      loadFormOptions();
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
      props.onSuccess?.();
      props.onClose?.();
    }
    
    setModalState((s) => ({ ...s, isOpen: false }));
    setFormSubmitted(false);
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

          {/* Autocompletar Estudiantes/Autores */}
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
            filterOptions={(options, params) => {
              const filtered = options.filter((option) => {
                // 💡 MODIFICADO: Usar getPersonaLabel para la búsqueda
                const label = getPersonaLabel(option).toLowerCase();
                const searchLower = params.inputValue.toLowerCase();
                return (
                  label.includes(searchLower) ||
                  String(option.ci).includes(searchLower)
                );
              });

              if (params.inputValue && filtered.length === 0) {
                return [
                  {
                    isNew: true,
                    nombre: params.inputValue,
                    ci: null,
                  },
                ];
              }
              return filtered;
            }}
            // 💡 MODIFICADO: Usar getPersonaLabel
            getOptionLabel={getPersonaLabel}
            onChange={(event, newValue) => {
              const hasNewOption = newValue.some((v) => v && v.isNew);
              if (hasNewOption) {
                const newOption = newValue.find((v) => v && v.isNew);
                const nameParts = newOption.nombre.trim().split(" ");
                setNewUserData({
                  nombre: nameParts[0] || "",
                  apellido: nameParts.slice(1).join(" ") || "",
                  ci: "",
                  ci_type: "V",
                });
                setCreateUserDialog({
                  open: true,
                  type: "estudiante",
                  inputValue: newOption.nombre,
                });
                const existingCis = newValue
                  .filter((v) => v && typeof v === "object" && v.ci && !v.isNew)
                  .map((v) => String(v.ci));
                handleInputChange("id_estudiantes", existingCis);
                return;
              }
              const selectedCis = newValue
                .filter((v) => v && typeof v === "object" && v.ci && !v.isNew)
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
                    // 💡 MODIFICADO: Usar getPersonaLabel para el chip
                    label={getPersonaLabel(option)}
                    {...chipProps}
                  />
                );
              })
            }
            noOptionsText="Escribe para buscar o crear un estudiante"
          />

          {/* Autocompletar Tutor */}
          <Autocomplete
            id="tutor-select"
            freeSolo
            options={dropdownOptions.profesores}
            value={
              dropdownOptions.profesores.find(
                (p) => String(p.ci) === formData.id_tutor
              ) || null
            }
            filterOptions={(options, params) => {
              const filtered = options.filter((option) => {
                // 💡 MODIFICADO: Usar getPersonaLabel para la búsqueda
                const label = getPersonaLabel(option).toLowerCase();
                const searchLower = params.inputValue.toLowerCase();
                return (
                  label.includes(searchLower) ||
                  String(option.ci).includes(searchLower)
                );
              });

              if (params.inputValue && filtered.length === 0) {
                return [
                  {
                    isNew: true,
                    nombre: params.inputValue,
                    ci: null,
                  },
                ];
              }
              return filtered;
            }}
            // 💡 MODIFICADO: Usar getPersonaLabel
            getOptionLabel={getPersonaLabel}
            onChange={(event, newValue) => {
              if (newValue && typeof newValue === "object" && newValue.isNew) {
                const nameParts = newValue.nombre.trim().split(" ");
                setNewUserData({
                  nombre: nameParts[0] || "",
                  apellido: nameParts.slice(1).join(" ") || "",
                  ci: "",
                  ci_type: "V",
                });
                setCreateUserDialog({
                  open: true,
                  type: "profesor",
                  inputValue: newValue.nombre,
                });
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

          {/* Autocompletar Encargado */}
          <Autocomplete
            id="encargado-select"
            options={dropdownOptions.encargados}
            // 💡 MODIFICADO: Usar getPersonaLabel
            getOptionLabel={getPersonaLabel}
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

          {/* Autocompletar Jurados */}
          <Autocomplete
            id="jurados-select"
            multiple
            options={dropdownOptions.profesores.filter(
              (p) => String(p.ci) !== formData.id_tutor
            )}
            // 💡 MODIFICADO: Usar getPersonaLabel
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
                    // 💡 MODIFICADO: Usar getPersonaLabel para el chip
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
        </div>
      </Box>
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleModalClose}
      />

      <Dialog
        open={createUserDialog.open}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            setCreateUserDialog({ open: false, type: null, inputValue: "" });
            setNewUserData({
              nombre: "",
              apellido: "",
              ci: "",
              ci_type: "V",
            });
          }
        }}
        maxWidth="sm"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonAddIcon />
            Crear nuevo {createUserDialog.type === "estudiante" ? "Estudiante" : "Profesor"}
          </Box>
        </DialogTitle>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <Box 
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Alert severity="info">
              Completa los datos para crear un nuevo{" "}
              {createUserDialog.type === "estudiante" ? "estudiante" : "profesor"}
            </Alert>

            <Box 
              sx={{ display: "flex", gap: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormControl 
                variant="filled" 
                sx={{ minWidth: 80 }}
                onClick={(e) => e.stopPropagation()}
              >
                <InputLabel>Tipo CI</InputLabel>
                <Select
                  value={newUserData.ci_type}
                  onChange={(e) => {
                    e.stopPropagation();
                    setNewUserData((prev) => ({ ...prev, ci_type: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem value="V">V</MenuItem>
                  <MenuItem value="E">E</MenuItem>
                  <MenuItem value="J">J</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Cédula"
                variant="filled"
                value={newUserData.ci}
                onChange={(e) => {
                  e.stopPropagation();
                  setNewUserData((prev) => ({ ...prev, ci: e.target.value }));
                }}
                onClick={(e) => e.stopPropagation()}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Nombre"
              variant="filled"
              value={newUserData.nombre}
              onChange={(e) => {
                e.stopPropagation();
                setNewUserData((prev) => ({ ...prev, nombre: e.target.value }));
              }}
              onClick={(e) => e.stopPropagation()}
              required
            />

            <TextField
              fullWidth
              label="Apellido"
              variant="filled"
              value={newUserData.apellido}
              onChange={(e) => {
                e.stopPropagation();
                setNewUserData((prev) => ({ ...prev, apellido: e.target.value }));
              }}
              onClick={(e) => e.stopPropagation()}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setCreateUserDialog({ open: false, type: null, inputValue: "" });
              setNewUserData({
                nombre: "",
                apellido: "",
                ci: "",
                ci_type: "V",
              });
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleCreateUser();
            }}
            variant="contained"
            disabled={
              !newUserData.nombre ||
              !newUserData.apellido ||
              !newUserData.ci
            }
            startIcon={<AddIcon />}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
});

export default TesisForm;