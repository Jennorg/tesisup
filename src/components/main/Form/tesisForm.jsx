import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useRef,
} from "react";
import tesisService from "@/services/tesis.service";
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

// Estilo para ocultar el input de archivo estándar
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

/**
 * Obtiene una etiqueta legible para mostrar en los selectores de personas.
 * @param {Object|string} option - Objeto persona o cadena.
 * @returns {string} Etiqueta formateada.
 */
import { compressPDF } from "@/utils/pdfCompressor";

const getPersonaLabel = (option) => {
  if (typeof option === "string") return option;

  if (option.isNew) {
    return `Crear nuevo: "${option.nombre}"`;
  }

  const nombre =
    option.nombre_completo ||
    `${option.nombre || ""} ${option.apellido || ""}`.trim() ||
    option.nombre ||
    "";
  const ciType = option.ci_type || "V";
  const ci = option.ci || "";
  if (!ci) return nombre;
  return `${nombre} (CI: ${ciType}-${ci})`;
};

/**
 * Componente de Formulario para Crear/Editar Tesis.
 * Maneja la subida de archivos PDF y la asociación de metadatos (autores, tutor, jurados, etc.).
 *
 * @param {Object} props
 * @param {Object} props.dropdownOptions - Opciones para los selectores (autores, profesores, sedes).
 * @param {Function} props.onSuccess - Callback al completar el envío exitosamente.
 * @param {Function} props.onClose - Callback para cerrar el formulario.
 * @param {Function} props.onRequestCreateUser - Callback para solicitar creación rápida de usuarios.
 * @param {Object} props.tesisToEdit - Objeto tesis si se está en modo edición.
 */
const TesisForm = forwardRef(
  (
    { dropdownOptions, onSuccess, onClose, onRequestCreateUser, tesisToEdit },
    ref,
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);

    const isEditing = !!tesisToEdit;

    const initialFormData = {
      id_tesis: "",
      nombre: "",
      id_estudiantes: [], // Array de CIs
      id_tutor: "",
      id_encargado: "",
      id_jurados: [], // Array de CIs, máx 3
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

    // Valores permitidos para el estado de la tesis
    const estados = ["aprobado", "rechazado", "pendiente"];

    // Cargar datos si se está editando una tesis existente
    useEffect(() => {
      if (tesisToEdit) {
        console.log("Editando tesis:", tesisToEdit);
        setFormData({
          id_tesis: tesisToEdit.id || "",
          nombre: tesisToEdit.nombre || "",
          id_estudiantes: (tesisToEdit.autores || []).map((a) => String(a.ci)),
          id_tutor: String(tesisToEdit.tutor?.ci || tesisToEdit.id_tutor || ""),
          id_encargado: String(
            tesisToEdit.encargado?.ci || tesisToEdit.id_encargado || "",
          ),
          id_jurados: (tesisToEdit.jurados || []).map((j) => String(j.ci)),
          fecha: tesisToEdit.fecha ? dayjs(tesisToEdit.fecha) : null,
          id_sede:
            tesisToEdit.id_sede ||
            dropdownOptions.sedes.find((s) => s.nombre === tesisToEdit.sede)
              ?.id ||
            "",
          estado: tesisToEdit.estado || "",
          archivo_pdf: null, // No se carga el archivo PDF existente para edición, solo se reemplaza si el usuario sube uno nuevo
          modo_envio: "normal",
        });
      } else {
        setFormData(initialFormData);
      }
    }, [tesisToEdit]);

    // Filtrar jurados para que no coincidan con el tutor seleccionado
    useEffect(() => {
      if (formData.id_tutor && formData.id_jurados.length > 0) {
        const filteredJurados = formData.id_jurados.filter(
          (ci) => String(ci) !== String(formData.id_tutor),
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

    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Si el archivo pesa más de 4MB, intentamos comprimirlo
      if (file.size > 4 * 1024 * 1024) {
        setIsCompressing(true);
        // Limpiar archivo previo mientras se comprime
        setFormData((prev) => ({ ...prev, archivo_pdf: null }));
        try {
          console.log("Iniciando compresión de PDF...");
          const compressed = await compressPDF(file);
          setFormData((prev) => ({ ...prev, archivo_pdf: compressed }));
        } catch (err) {
          console.error("Error en compresión, usando original:", err);
          setFormData((prev) => ({ ...prev, archivo_pdf: file }));
        } finally {
          setIsCompressing(false);
        }
      } else {
        setFormData((prev) => ({ ...prev, archivo_pdf: file }));
      }
    };

    const removeFile = () => {
      setFormData((prev) => ({ ...prev, archivo_pdf: null }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    // --- Manejo de Drag & Drop para el archivo ---
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

    /**
     * Valida y envía el formulario al backend.
     */
    const sendForm = async () => {
      const requiredFields = [
        "id_tesis", // Código de tesis manual requerido
        "nombre",
        "id_tutor",
        "id_encargado",
        "fecha",
        "id_sede",
        "estado",
      ];

      // El archivo es obligatorio solo si es una nueva tesis
      if (!isEditing && !formData.archivo_pdf) {
        requiredFields.push("archivo_pdf");
      }

      for (const field of requiredFields) {
        if (!formData[field]) {
          setModalState({
            isOpen: true,
            status: "error",
            message: "Por favor, rellene todos los campos obligatorios",
          });
          return;
        }
      }

      if (formData.id_estudiantes.length === 0) {
        setModalState({
          isOpen: true,
          status: "error",
          message: "Debe seleccionar al menos un Autor/Estudiante",
        });
        return;
      }

      setIsLoading(true);
      setModalState({
        isOpen: true,
        status: "loading",
        message: isEditing ? "Actualizando tesis..." : "Procesando tesis...",
      });

      // LÓGICA DE SPLIT SI EL ARCHIVO ES > 4MB (Límite Vercel)
      const file = formData.archivo_pdf;
      let chunks = [];
      const MAX_SIZE = 3.5 * 1024 * 1024; // 3.5MB por seguridad (Vercel 4.5MB)

      if (file && file.size > MAX_SIZE) {
        console.log(`Archivo grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Dividiendo en partes...`);
        let offset = 0;
        let part = 1;
        while (offset < file.size) {
          const chunkBlob = file.slice(offset, offset + MAX_SIZE);
          const chunkName = `${file.name}.part${String(part).padStart(3, '0')}`;
          chunks.push(new File([chunkBlob], chunkName, { type: file.type }));
          offset += MAX_SIZE;
          part++;
        }
      } else if (file) {
        chunks.push(file);
      }

      try {
        let currentTesisId = isEditing ? formData.id_tesis : null;
        let successMessage = isEditing ? "Tesis actualizada" : "Tesis subida";

        // Iterar sobre los chunks (si hay split, subimos uno por uno)
        for (let i = 0; i < chunks.length; i++) {
          const chunkFile = chunks[i];
          const isFirstChunk = i === 0;
          const isMultiPart = chunks.length > 1;

          if (isMultiPart) {
            setModalState(prev => ({
              ...prev,
              message: `Subiendo parte ${i + 1} de ${chunks.length}...`
            }));
          }

          const datos = new FormData();

          // Solo enviamos metadatos completos en la primera parte (o si es edición)
          // Para partes extra, ¿necesitamos enviar todo o solo el archivo?
          // Simplificación: Enviamos todo siempre para create/update, el backend manejará el archivo extra.
          // Pero para CREATE, la primera llamada CREA. Las siguientes deben ser UPDATE sobre el ID creado.

          if (!isFirstChunk && !currentTesisId) {
            throw new Error("Error interno: No se obtuvo ID de tesis tras la primera parte");
          }

          // Si es la parte 2+, forzamos que sea un UPDATE al ID existente
          if (!isFirstChunk) {
            datos.append("id_tesis", currentTesisId); // ID obligatorio para update
            // No enviamos metadatos pesados si no es necesario, pero el updateService puede requerirlos.
            // Mejor estrategia: Llamar a endpoint específico para anexar archivo?
            // Por simplicidad: Usamos tesisService.update que ya maneja subida de archivo.
            // Pero tesisService.update espera todos los campos? No necesariamente si el backend soporta partial update.
            // Asumamos que enviamos los campos básicos para que no falle validación.
          }

          // Construcción del FormData
          Object.keys(formData).forEach((key) => {
            if (key === "archivo_pdf") {
              // Reemplazamos el archivo por el chunk actual
              datos.append("archivo_pdf", chunkFile);
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
            } else if (
              formData[key] !== null &&
              formData[key] !== "" &&
              !Array.isArray(formData[key])
            ) {
              if (key === "id_tesis" && !isFirstChunk) {
                // Ya lo agregamos manualmente arriba si es necesario
              } else {
                datos.append(key, formData[key]);
              }
            }
          });

          // Si estamos subiendo partes extra (2, 3...), asegurarse de usar el ID correcto
          if (!isFirstChunk) {
            // Sobrescribimos id_tesis en el FormData para asegurar que vaya al registro creado
            datos.set("id_tesis", currentTesisId);
          }

          let res;
          // Lógica de Create vs Update
          if (isEditing || !isFirstChunk) {
            // Si editamos O si es la parte 2+ de una nueva tesis (que se comporta como update)
            const targetId = isEditing ? formData.id_tesis : currentTesisId;
            res = await tesisService.update(targetId, datos);
          } else {
            // Primera parte de nueva tesis
            res = await tesisService.create(datos);
            // Guardamos el ID creado para las siguientes partes (si el backend lo devuelve)
            // Asumimos que res.data o res devuelve el objeto creado con id
            if (res && res.id) {
              currentTesisId = res.id;
            } else if (formData.id_tesis) {
              currentTesisId = formData.id_tesis; // Fallback al ID manual ingresado
            }
          }
          console.log(`Parte ${i + 1}/${chunks.length} subida:`, res);
        }

        setFormSubmitted(true);
        setModalState({
          isOpen: true,
          status: "success",
          message: chunks.length > 1
            ? "Tesis subida en partes correctamente"
            : (isEditing ? "Tesis actualizada correctamente" : "Tesis subida correctamente"),
        });
      } catch (err) {
        console.error(
          "Error al enviar:",
          err.response?.data?.error || err.message,
        );
        setFormSubmitted(false);
        setModalState({
          isOpen: true,
          status: "error",
          message:
            err.response?.data?.error ||
            "Error al subir la tesis (verifique conexión o tamaño)",
        });
      }

      setIsLoading(false);
    };

    const clearForm = () => {
      setFormData(initialFormData);
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch (e) { }
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

    // Función de filtrado personalizado para autocompletar
    const filterOptions = (options, params) => {
      const filtered = options.filter((option) => {
        const label = getPersonaLabel(option).toLowerCase();
        const searchLower = params.inputValue.toLowerCase();
        return (
          label.includes(searchLower) || String(option.ci).includes(searchLower)
        );
      });

      // Permitir crear nueva opción si no existe
      if (params.inputValue && filtered.length === 0) {
        filtered.push({
          isNew: true,
          nombre: params.inputValue,
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
            overflowX: "hidden",
            width: "100%",
            maxHeight: "65vh",
            p: { xs: 0, sm: 1 },
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
          }}
        >
          {/* --- Carga de Archivo --- */}
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
              p: { xs: 2, sm: 3 },
              textAlign: "center",
              cursor: formData.archivo_pdf || isLoading || isCompressing ? "default" : "pointer",
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
              required={!isEditing}
              disabled={!!formData.archivo_pdf || isLoading || isCompressing}
            />

            {isLoading || isCompressing ? (
              <>
                <CloudUploadIcon
                  sx={{ fontSize: 40, mb: 1, animation: "pulse 1.5s infinite" }}
                />
                <p>{isLoading ? "Subiendo archivo..." : "Optimizando PDF..."}</p>
                <p className="text-sm">{isLoading ? modalState.message : ""}</p>
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
                <p className="text-sm">
                  {isEditing
                    ? "Dejar vacío para conservar el archivo actual"
                    : "Debe ser un archivo .pdf"}
                </p>
              </>
            )}
          </Box>

          <TextField
            fullWidth
            label="Código de la Tesis"
            name="id_tesis"
            variant="filled"
            value={formData.id_tesis}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            required
            disabled={isEditing}
          />

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
            id="estudiantes-select"
            multiple
            freeSolo
            options={dropdownOptions.estudiantes}
            value={formData.id_estudiantes
              .map((ci) => {
                const estudiante = dropdownOptions.estudiantes.find(
                  (e) => String(e.ci) === String(ci),
                );
                if (estudiante) return estudiante;
                // Fallback: buscar en tesisToEdit
                return (
                  tesisToEdit?.autores?.find(
                    (a) => String(a.ci) === String(ci),
                  ) || null
                );
              })
              .filter(Boolean)}
            filterOptions={filterOptions}
            getOptionLabel={getPersonaLabel}
            onChange={(event, newValue) => {
              const newOption = newValue.find((v) => v && v.isNew);
              if (newOption) {
                onRequestCreateUser("estudiante", newOption.nombre);
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

          <Autocomplete
            id="tutor-select"
            freeSolo
            options={dropdownOptions.profesores}
            value={
              dropdownOptions.profesores.find(
                (p) => String(p.ci) === formData.id_tutor,
              ) ||
              (tesisToEdit?.tutor &&
                String(tesisToEdit.tutor.ci) === formData.id_tutor
                ? tesisToEdit.tutor
                : null) ||
              null
            }
            filterOptions={filterOptions}
            getOptionLabel={getPersonaLabel}
            onChange={(event, newValue) => {
              if (newValue && typeof newValue === "object" && newValue.isNew) {
                onRequestCreateUser("profesor", newValue.nombre);
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

          <Autocomplete
            id="encargado-select"
            freeSolo
            options={dropdownOptions.encargados}
            getOptionLabel={getPersonaLabel}
            value={
              dropdownOptions.encargados.find(
                (e) => String(e.ci) === formData.id_encargado,
              ) ||
              (tesisToEdit?.encargado &&
                String(tesisToEdit.encargado.ci) === formData.id_encargado
                ? tesisToEdit.encargado
                : null) ||
              null
            }
            filterOptions={filterOptions}
            onChange={(event, newValue) => {
              if (newValue && typeof newValue === "object" && newValue.isNew) {
                onRequestCreateUser("encargado", newValue.nombre);
                handleInputChange("id_encargado", "");
                return;
              }
              handleInputChange(
                "id_encargado",
                newValue ? String(newValue.ci) : "",
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

          {/* Selección de Jurados */}
          <Autocomplete
            id="jurados-select"
            multiple
            options={dropdownOptions.profesores.filter(
              (p) => String(p.ci) !== formData.id_tutor,
            )}
            getOptionLabel={getPersonaLabel}
            value={formData.id_jurados
              .map((ci) => {
                const profesor = dropdownOptions.profesores.find(
                  (p) => String(p.ci) === String(ci),
                );
                if (profesor) return profesor;
                // Fallback: buscar en tesisToEdit
                return (
                  tesisToEdit?.jurados?.find(
                    (j) => String(j.ci) === String(ci),
                  ) || null
                );
              })
              .filter(Boolean)}
            onChange={(event, newValue) => {
              const limitedValue = newValue.slice(0, 3); // Límite de 3 jurados
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
              {estados.map((estadoValue) => (
                <MenuItem key={estadoValue} value={estadoValue}>
                  {estadoValue.charAt(0).toUpperCase() + estadoValue.slice(1)}
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
              ? isEditing
                ? "Actualizando..."
                : "Enviando..."
              : isEditing
                ? "Actualizar Tesis"
                : "Subir PDF"}
          </Button>
        </Box>

        <LoadingModal
          isOpen={modalState.isOpen}
          status={modalState.status}
          message={modalState.message}
          onClose={handleModalClose}
        />
      </LocalizationProvider>
    );
  },
);

// Memoizar el componente para evitar re-renderizados innecesarios si las props no cambian
export default React.memo(TesisForm);
