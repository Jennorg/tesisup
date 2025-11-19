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

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const API_URL = import.meta.env.VITE_API_URL;

const initialFilters = {
  nombre: "",
  autor: "",
  encargado: "",
  fechaDesde: null,
  fechaHasta: null,
  tutor: "",
  sede: "",
  estado: "",
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
      autor: "id_estudiante", // El backend probablemente espera id_estudiante
      encargado: "id_encargado",
      tutor: "id_tutor",
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

          <FormControl variant="filled" fullWidth>
            <InputLabel id="autor-label">Autor</InputLabel>
            <Select
              labelId="autor-label"
              id="autor-select"
              name="autor"
              value={filters.autor}
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {dropdownOptions.autores.map((autor) => (
                <MenuItem
                  key={autor.ci ?? autor.id}
                  value={String(autor.ci ?? autor.id)}
                >
                  {autor.nombre_completo || autor.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="filled" fullWidth>
            <InputLabel id="encargado-label">Encargado</InputLabel>
            <Select
              labelId="encargado-label"
              id="encargado-select"
              name="encargado"
              value={filters.encargado}
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {dropdownOptions.encargados.map((encargado) => (
                <MenuItem
                  key={encargado.ci ?? encargado.id}
                  value={String(encargado.ci ?? encargado.id)}
                >
                  {encargado.nombre_completo || encargado.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

          <FormControl variant="filled" fullWidth>
            <InputLabel id="tutor-label">Tutor</InputLabel>
            <Select
              labelId="tutor-label"
              id="tutor-select"
              name="tutor"
              value={filters.tutor}
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {dropdownOptions.tutores.map((tutor) => (
                <MenuItem
                  key={tutor.ci ?? tutor.id}
                  value={String(tutor.ci ?? tutor.id)}
                >
                  {tutor.nombre_completo || tutor.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="filled" fullWidth>
            <InputLabel id="sede-label">Sede</InputLabel>
            <Select
              labelId="sede-label"
              id="sede-select"
              name="sede"
              value={filters.sede}
              onChange={handleInputChange}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {dropdownOptions.sedes.map((sede) => (
                <MenuItem key={sede.id} value={String(sede.id)}>
                  {sede.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
