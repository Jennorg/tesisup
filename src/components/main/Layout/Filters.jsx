import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const API_URL = import.meta.env.VITE_API_URL;

const initialFilters = {
  nombre: "",
  autor: [], // Changed to array for multi-select
  encargado: "",
  fechaDesde: null,
  fechaHasta: null,
  tutor: "",
  jurado: [], // Added jurado filter
  sede: "",
  estado: "",
};

const getPersonaLabel = (option) => {
  if (typeof option === "string") return option;
  
  const nombre = option.nombre_completo || `${option.nombre || ''} ${option.apellido || ''}`.trim() || option.nombre || "";
  const ciType = option.ci_type || "V";
  const ci = option.ci || option.id || "";
  
  // Si no hay CI/ID, solo mostrar el nombre
  if (!ci) return nombre;
  
  // Formato: "Nombre (CI: V-123456)"
  return `${nombre} (CI: ${ciType}-${ci})`;
};

const Filters = ({ onClose, onApply }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [dropdownOptions, setDropdownOptions] = useState({
    autores: [], // Estudiantes
    encargados: [],
    tutores: [], // Profesores
    sedes: [],
  });

  const estados = ["aprobado", "rechazado", "pendiente"];

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [estudiantesRes, encargadosRes, profesoresRes, sedesRes] =
          await Promise.all([
            axios.get(`${API_URL}/estudiantes`),
            axios.get(`${API_URL}/encargado`),
            axios.get(`${API_URL}/profesor`),
            axios.get(`${API_URL}/sede`),
          ]);

        setDropdownOptions({
          autores: estudiantesRes.data.data || [],
          encargados: encargadosRes.data.data || [],
          tutores: profesoresRes.data.data || [],
          sedes: sedesRes.data.data || [],
        });
      } catch (error) {
        console.error("Error al cargar opciones de filtro:", error);
      }
    };

    fetchDropdownOptions();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Mantener como string para que coincida con los MenuItems
    // Se convertirá a número solo al aplicar el filtro
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleDateChange = (name) => (date) => {
    setFilters({
      ...filters,
      [name]: date,
    });
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    onApply?.(null); // Limpiar los filtros en el componente padre
  };

  const handleFilter = () => {
    // Mapear nombres de filtros a nombres que espera el backend
    const filterMapping = {
      // autor: "id_estudiante", // Handled manually for arrays
      encargado: "id_encargado",
      tutor: "id_tutor",
      // jurado: "id_jurado", // Handled manually for arrays
      sede: "id_sede",
    };

    const filtersToApply = {
      nombre: filters.nombre || undefined,
      fecha_desde: filters.fechaDesde
        ? dayjs(filters.fechaDesde).format("YYYY-MM-DD")
        : undefined,
      fecha_hasta: filters.fechaHasta
        ? dayjs(filters.fechaHasta).format("YYYY-MM-DD")
        : undefined,
      estado: filters.estado || undefined,
    };

    // Mapear y convertir campos numéricos
    Object.entries(filterMapping).forEach(([frontendKey, backendKey]) => {
      const value = filters[frontendKey];
      if (value && value !== "") {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          filtersToApply[backendKey] = numValue;
        }
      }
    });

    // Handle array filters (autor and jurado)
    if (Array.isArray(filters.autor) && filters.autor.length > 0) {
      // If backend expects multiple parameters with same name (e.g. id_estudiante=1&id_estudiante=2)
      // or comma separated. For axios params serializer, arrays are usually handled well.
      // Let's pass the array directly, axios will handle it as id_estudiante[]=1 or similar depending on config.
      // But often backends expect a specific format. Let's assume standard array for now.
      filtersToApply["id_estudiante"] = filters.autor;
    }

    if (Array.isArray(filters.jurado) && filters.jurado.length > 0) {
      filtersToApply["id_jurado"] = filters.jurado;
    }

    // Eliminar valores undefined para no enviar queries innecesarias
    Object.keys(filtersToApply).forEach((key) => {
      if (
        filtersToApply[key] === undefined ||
        filtersToApply[key] === null ||
        filtersToApply[key] === ""
      ) {
        delete filtersToApply[key];
      }
    });

    // Si no hay filtros aplicados, pasar null para limpiar
    const hasFilters = Object.keys(filtersToApply).length > 0;
    console.log("Filtrando con:", filtersToApply);
    onApply?.(hasFilters ? filtersToApply : null);
    if (onClose) {
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          height: "100%",
          bgcolor: "background.paper",
          color: "text.primary",
          backdropFilter: "blur(10px)",
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Filtros
          </Typography>
          {onClose && (
            <IconButton
              onClick={onClose}
              sx={{ color: "text.primary" }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* Filters Content */}
        <Box
          sx={{
            p: 2,
            flex: 1,
            overflow: "auto",
            "& .MuiTextField-root": {
              mb: 2,
            },
            "& .MuiFormControl-root": {
              mb: 2,
            },
          }}
        >
          <TextField
            id="nombre-tesis"
            name="nombre"
            label="Nombre de la Tesis"
            variant="filled"
            value={filters.nombre}
            onChange={handleInputChange}
            fullWidth
          />

          <Autocomplete
            id="autor-select"
            multiple
            options={dropdownOptions.autores}
            getOptionLabel={getPersonaLabel}
            value={filters.autor.map(id => 
              dropdownOptions.autores.find(a => String(a.ci ?? a.id) === String(id))
            ).filter(Boolean)}
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "autor",
                  value: newValue.map(v => String(v.ci ?? v.id)),
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Autores"
                variant="filled"
                fullWidth
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={getPersonaLabel(option)}
                  {...getTagProps({ index })}
                  key={option.ci ?? option.id}
                />
              ))
            }
            noOptionsText="No se encontraron autores"
          />

          <Autocomplete
            id="encargado-select"
            options={dropdownOptions.encargados}
            getOptionLabel={getPersonaLabel}
            value={
              dropdownOptions.encargados.find(
                (e) => String(e.ci ?? e.id) === String(filters.encargado)
              ) || null
            }
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "encargado",
                  value: newValue ? String(newValue.ci ?? newValue.id) : "",
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Encargado"
                variant="filled"
                fullWidth
              />
            )}
            noOptionsText="No se encontraron encargados"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 2,
              mb: 2,
            }}
          >
            <DatePicker
              label="Fecha desde"
              value={filters.fechaDesde}
              onChange={handleDateChange("fechaDesde")}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  variant: "filled",
                  fullWidth: true,
                },
              }}
            />

            <DatePicker
              label="Fecha hasta"
              value={filters.fechaHasta}
              onChange={handleDateChange("fechaHasta")}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  variant: "filled",
                  fullWidth: true,
                },
              }}
            />
          </Box>

          <Autocomplete
            id="tutor-select"
            options={dropdownOptions.tutores}
            getOptionLabel={getPersonaLabel}
            value={
              dropdownOptions.tutores.find(
                (t) => String(t.ci ?? t.id) === String(filters.tutor)
              ) || null
            }
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "tutor",
                  value: newValue ? String(newValue.ci ?? newValue.id) : "",
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tutor"
                variant="filled"
                fullWidth
              />
            )}
            noOptionsText="No se encontraron tutores"
          />

          <Autocomplete
            id="jurado-select"
            multiple
            options={dropdownOptions.tutores} // Jurados are professors
            getOptionLabel={getPersonaLabel}
            value={filters.jurado.map(id => 
              dropdownOptions.tutores.find(t => String(t.ci ?? t.id) === String(id))
            ).filter(Boolean)}
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "jurado",
                  value: newValue.map(v => String(v.ci ?? v.id)),
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Jurados"
                variant="filled"
                fullWidth
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={getPersonaLabel(option)}
                  {...getTagProps({ index })}
                  key={option.ci ?? option.id}
                />
              ))
            }
            noOptionsText="No se encontraron jurados"
          />

          <Autocomplete
            id="sede-select"
            options={dropdownOptions.sedes}
            getOptionLabel={(option) => option.nombre}
            value={
              dropdownOptions.sedes.find(
                (s) => String(s.id) === String(filters.sede)
              ) || null
            }
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "sede",
                  value: newValue ? String(newValue.id) : "",
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sede"
                variant="filled"
                fullWidth
              />
            )}
            noOptionsText="No se encontraron sedes"
          />

          <FormControl variant="filled" fullWidth>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select
              labelId="estado-label"
              id="estado-select"
              name="estado"
              value={filters.estado}
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {estados.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            gap: 1,
          }}
        >
          <Button variant="outlined" onClick={handleClearFilters} fullWidth>
            Limpiar
          </Button>

          <Button variant="contained" onClick={handleFilter} fullWidth>
            Filtrar
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Filters;
