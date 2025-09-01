import React, { useState } from "react";

import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

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

const Aside = () => {
  const [filters, setFilters] = useState(initialFilters);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    console.log("Filtros limpiados");
  };

  const handleFilter = () => {
    // Aquí iría la lógica para aplicar los filtros
    console.log("Filtrando con:", filters);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="grid gap-4 p-4 border-r border-gray-200 h-full">
        <h2 className="text-xl font-semibold">Filtros</h2>

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
            {/* TODO: Llenar con datos reales */}
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
            {/* TODO: Llenar con datos reales */}
          </Select>
        </FormControl>

        <div className="grid gap-4 grid-cols-2">
          <DatePicker
            label="Fecha desde"
            value={filters.fechaDesde}
            onChange={handleDateChange("fechaDesde")}
            format="DD/MM/YYYY"
            slotProps={{ textField: { variant: "filled", fullWidth: true } }}
          />

          <DatePicker
            label="Fecha hasta"
            value={filters.fechaHasta}
            onChange={handleDateChange("fechaHasta")}
            format="DD/MM/YYYY"
            slotProps={{ textField: { variant: "filled", fullWidth: true } }}
          />
        </div>

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
            {/* TODO: Llenar con datos reales */}
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
            {/* TODO: Llenar con datos reales */}
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
            {/* TODO: Llenar con datos reales */}
          </Select>
        </FormControl>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outlined"
            // startIcon={<DeleteIcon />}
            onClick={handleClearFilters}
            fullWidth
          >
            Limpiar
          </Button>

          <Button
            variant="contained"
            // endIcon={<DownloadIcon />}
            onClick={handleFilter}
            fullWidth
          >
            Filtrar
          </Button>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default Aside;
