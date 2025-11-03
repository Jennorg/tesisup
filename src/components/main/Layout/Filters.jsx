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
  autor: null,
  encargado: null,
  fechaDesde: null,
  fechaHasta: null,
  tutor: null,
  sede: null,
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

  const estados = ["aprobado", "rechazado", "pendiente", "en revisión"]; // Asumiendo que estos son estáticos

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
    // Normalizar ids numéricos para autor/encargado/tutor/sede
    const numericFields = ["autor", "encargado", "tutor", "sede"];
    const newValue = numericFields.includes(name)
      ? value === "" || value === null
        ? null
        : Number(value)
      : value;

    setFilters({
      ...filters,
      [name]: newValue,
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
    console.log("Filtros limpiados");
    onApply?.(initialFilters);
  };

  const handleFilter = () => {
    // Llama al callback proporcionado por el padre con los filtros actuales
    console.log("Filtrando con:", filters);
    onApply?.(filters);
    if (onClose) {
      onClose(); // Cerrar drawer en móvil después de filtrar
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
                  value={autor.ci ?? autor.id}
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
                  value={encargado.ci ?? encargado.id}
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
                  value={tutor.ci ?? tutor.id}
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
                <MenuItem key={sede.id} value={sede.id}>
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
