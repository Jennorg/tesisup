import React, { useState, useEffect } from "react";
import authService from "@/services/auth.service";
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Box,
  Alert,
  Autocomplete,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import LoadingModal from "@/hooks/Modals/LoadingModal";

const API_URL = import.meta.env.VITE_API_URL;
const VITE_API_URL = API_URL || "http://localhost:8080/api";

// 💡 1. PROPS ACTUALIZADAS: Recibe 'prefillData' y 'onPrefillConsumed'
const PersonaForm = ({
  role,
  onUserCreated,
  sedes = [],
  prefillData,
  onPrefillConsumed,
}) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  const initialData = {
    nombre: "",
    apellido: "",
    ci: "",
    ci_type: "V",
    email: "",
    telefono: "",
    password: "",
    id_sede: "",
  };

  const [newUserData, setNewUserData] = useState(initialData);
  const [showPassword, setShowPassword] = useState(false);

  // 💡 2. NUEVO USEEFFECT: Observa prefillData para pre-llenar el formulario
  useEffect(() => {
    // Si recibimos prefillData Y el tipo coincide con el rol de este formulario
    if (prefillData && prefillData.type === role) {
      const nameParts = prefillData.name.trim().split(" ");
      const nombre = nameParts[0] || "";
      const apellido = nameParts.slice(1).join(" ") || "";

      setNewUserData((prev) => ({
        ...initialData, // Limpia el formulario
        nombre: nombre,
        apellido: apellido,
      }));

      // Limpia el pre-llenado en el padre para que no se reutilice
      onPrefillConsumed();
    }
  }, [prefillData, role, onPrefillConsumed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (name, value) => {
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async () => {
    let endpoint = "";
    if (role === "estudiante") endpoint = "estudiantes";
    else if (role === "profesor") endpoint = "profesor";
    else if (role === "encargado") endpoint = "encargado";

    setModalState({
      isOpen: true,
      status: "loading",
      message: `Creando ${role}...`,
    });

    try {
      const isEncargado = role === "encargado";
      const ciString = String(newUserData.ci);
      const ciTypeString = String(newUserData.ci_type || "V");

      const emailToSend = isEncargado
        ? String(newUserData.email)
        : newUserData.email || `temporal${ciString}@uneg.edu.ve`;

      const telefonoToSend = newUserData.telefono || "00000000000";

      const passwordToSend = isEncargado
        ? String(newUserData.password)
        : `${ciTypeString}${ciString}`;

      const payload = {
        ...newUserData,
        ci: parseInt(newUserData.ci),
        ci_type: ciTypeString,
        nombre: String(newUserData.nombre),
        apellido: String(newUserData.apellido),
        email: emailToSend,
        telefono: telefonoToSend,
        password: passwordToSend,
      };

      if (role === "encargado") {
        payload.id_sede = parseInt(newUserData.id_sede);
      } else {
        delete payload.id_sede;
      }

      await authService.register(endpoint, payload);

      if (onUserCreated) {
        onUserCreated();
      }

      setModalState({
        isOpen: true,
        status: "success",
        message: `${
          role.charAt(0).toUpperCase() + role.slice(1)
        } creado correctamente.`,
      });

      setNewUserData(initialData);
    } catch (err) {
      console.error(`Error al crear ${role}:`, err);
      setModalState({
        isOpen: true,
        status: "error",
        message: err.response?.data?.error || `Error al crear ${role}`,
      });
    }
  };

  const handleModalClose = () => {
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  const isBaseInvalid =
    !newUserData.nombre || !newUserData.apellido || !newUserData.ci;
  let isFormInvalid = isBaseInvalid;

  if (role === "encargado") {
    isFormInvalid =
      isBaseInvalid ||
      !newUserData.email ||
      !newUserData.password ||
      !newUserData.id_sede;
  }

  return (
    <Box
      component="form"
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
      {role === "encargado" ? (
        <Alert severity="info">
          Rellena los campos para crear un nuevo {role}. Teléfono es opcional.
        </Alert>
      ) : (
        <Alert severity="info">
          Rellena los campos para crear un nuevo {role}. Email y teléfono son
          opcionales.
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl variant="filled" sx={{ minWidth: 100 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            name="ci_type"
            value={newUserData.ci_type}
            onChange={handleInputChange}
          >
            <MenuItem value="V">V</MenuItem>
            <MenuItem value="E">E</MenuItem>
            <MenuItem value="J">J</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Cédula"
          name="ci"
          variant="filled"
          value={newUserData.ci}
          onChange={handleInputChange}
          required
        />
      </Box>

      <TextField
        fullWidth
        label="Nombre"
        name="nombre"
        variant="filled"
        value={newUserData.nombre}
        onChange={handleInputChange}
        required
      />

      <TextField
        fullWidth
        label="Apellido"
        name="apellido"
        variant="filled"
        value={newUserData.apellido}
        onChange={handleInputChange}
        required
      />

      {role !== "encargado" && (
        <>
          <TextField
            fullWidth
            label="Correo Electrónico (Opcional)"
            name="email"
            variant="filled"
            type="email"
            value={newUserData.email}
            onChange={handleInputChange}
          />

          <TextField
            fullWidth
            label="Teléfono (Opcional)"
            name="telefono"
            variant="filled"
            type="tel"
            value={newUserData.telefono}
            onChange={handleInputChange}
          />
        </>
      )}

      {role === "encargado" && (
        <>
          <TextField
            fullWidth
            label="Correo Electrónico"
            name="email"
            variant="filled"
            type="email"
            value={newUserData.email}
            onChange={handleInputChange}
            required
          />

          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            variant="filled"
            type={showPassword ? "text" : "password"}
            value={newUserData.password}
            onChange={handleInputChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Autocomplete
            id="sede-select-encargado"
            options={sedes}
            getOptionLabel={(option) => option.nombre}
            value={
              sedes.find((s) => String(s.id) === String(newUserData.id_sede)) ||
              null
            }
            onChange={(event, newValue) => {
              handleAutocompleteChange("id_sede", newValue ? newValue.id : "");
            }}
            disablePortal
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sede Asignada"
                variant="filled"
                fullWidth
                required
              />
            )}
            noOptionsText="No hay sedes registradas"
          />

          <TextField
            fullWidth
            label="Teléfono (Opcional)"
            name="telefono"
            variant="filled"
            type="tel"
            value={newUserData.telefono}
            onChange={handleInputChange}
          />
        </>
      )}

      <Button
        type="button"
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleCreateUser}
        disabled={isFormInvalid || modalState.isOpen}
        startIcon={<AddIcon />}
        sx={{ py: 1.5, mt: 1 }}
      >
        Crear {role}
      </Button>

      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleModalClose}
      />
    </Box>
  );
};

export default PersonaForm;
