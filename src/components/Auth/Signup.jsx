import { useEffect, useState, useCallback } from "react";
import authService from "@/services/auth.service";
import userService from "@/services/user.service";
import handleInputChange from "@/hooks/utils/handleInputChange";
import { useNavigate, Link } from "react-router-dom";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { useAuth } from "@/context/AuthContext";

import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

/**
 * Componente de Registro de Usuario (SignUp)
 * Permite registrar nuevos usuarios (Estudiantes, Profesores, Encargados).
 * Incluye validación de formulario, carga de sedes dinámicamente y login automático tras registro exitoso.
 */
const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    ci: "",
    password: "",
    telefono: "",
    id_sede: "",
    ci_type: "V",
    user_type: "Encargado",
  });

  const [sedeOptions, setSedeOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Obtener lista de sedes disponibles al montar el componente
  const fetchSedes = async () => {
    try {
      const data = await userService.getSedes();
      if (data.data.length > 0 && !formData.id_sede) {
        setFormData((prev) => ({ ...prev, id_sede: data.data[0].id }));
      }
      setSedeOptions(data.data);
      console.log("Sedes obtenidas:", data.data);
    } catch (error) {
      console.error("Error fetching sedes:", error);
      setSedeOptions([]);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleInput = (e) => {
    handleInputChange(e, setFormData);
  };

  /**
   * Maneja el envío del formulario de registro.
   * Valida el tipo de usuario y prepara el payload para el endpoint correspondiente.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userTypeEndpoint = {
      Encargado: "encargado",
      Profesor: "profesor",
      Estudiante: "estudiantes",
    };

    const endpoint = userTypeEndpoint[formData.user_type];

    if (!endpoint) {
      setModalState({
        isOpen: true,
        status: "error",
        message: "Tipo de usuario no válido",
      });
      return;
    }

    const payload = {
      ...formData,
      ci: parseInt(formData.ci),
      telefono: formData.telefono.toString(),
      id_sede: parseInt(formData.id_sede),
    };

    // Eliminar campo auxiliar user_type que no espera el backend
    delete payload.user_type;

    console.log("Datos enviados al servidor:", payload);

    setModalState({
      isOpen: true,
      status: "loading",
      message: "Registrando usuario...",
    });

    try {
      const registerResponse = await authService.register(endpoint, payload);

      console.log("Respuesta del servidor:", registerResponse);
      setModalState({
        isOpen: true,
        status: "success",
        message: `${formData.user_type} creado correctamente`,
      });

      // Intentar iniciar sesión automáticamente con las credenciales proporcionadas
      try {
        const loginData = await authService.login({
          email: formData.email,
          password: formData.password,
        });
        const { token, user } = loginData;

        // Guardar token/usuario en el contexto global
        authLogin(user, token);

        // Navegar a la página principal ya autenticado
        navigate("/");
      } catch (loginErr) {
        // Si el login automático falla, notificar al usuario para login manual
        console.warn("Auto-login falló después del registro:", loginErr);
        setModalState({
          isOpen: true,
          status: "error",
          message:
            loginErr.response?.data?.error ||
            "Registro exitoso, pero no se pudo iniciar sesión automáticamente. Inicia sesión manualmente",
        });
        navigate("/login");
      }
    } catch (err) {
      console.error("Error al enviar:", err);
      setModalState({
        isOpen: true,
        status: "error",
        message:
          err.response?.data?.error ||
          `Error al registrar ${formData.user_type}. Intente de nuevo.`,
      });
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleCloseModal = useCallback(() => {
    if (modalState.status === "success") {
      navigate("/");
    }
    setModalState({ isOpen: false, status: "loading", message: "" });
  }, [modalState.status, navigate]);

  return (
    <div className="flex w-dvw h-dvh bg-[var(--background-paper)] shadow-lg overflow-hidden">
      {/* Panel izquierdo con imagen (oculto en móvil) */}
      <div className="hidden md:flex flex-1">
        <img
          src="/img/fondo1.jpg"
          alt="Imagen Registro"
          className="w-full h-full object-cover overflow-clip"
        />
      </div>

      {/* Modal de Feedback */}
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleCloseModal}
      />

      {/* Formulario de Registro */}
      <form
        className="flex flex-1 flex-col gap-4 p-6 text-center align-middle items-center overflow-y-auto pt-8"
        onSubmit={handleSubmit}
      >
        <img
          src="/img/uneg-logo.png"
          alt="Logo UNEG"
          className="mx-auto w-24 h-24"
        />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Registro de Usuario
        </h1>

        {/* -------------------- INICIO CAMPOS AGRUPADOS -------------------- */}

        {/* Nombre y Apellido en la misma línea */}
        <Box
          sx={{
            display: "flex",
            width: "90%",
            gap: 2,
            alignItems: "flex-end",
            marginBottom: 2,
          }}
        >
          {/* Nombre */}
          <Box sx={{ display: "flex", alignItems: "flex-end", flex: 1 }}>
            <PersonOutlineOutlinedIcon
              sx={{ color: "action.active", mr: 1, my: 0.5 }}
            />
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInput}
              variant="standard"
            />
          </Box>
          {/* Apellido */}
          <Box sx={{ display: "flex", alignItems: "flex-end", flex: 1 }}>
            <PersonOutlineOutlinedIcon
              sx={{ color: "action.active", mr: 1, my: 0.5 }}
            />
            <TextField
              fullWidth
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleInput}
              variant="standard"
            />
          </Box>
        </Box>

        {/* Correo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "90%",
            marginBottom: 2,
          }}
        >
          <MailOutlineIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            fullWidth
            label="Correo"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInput}
            variant="standard"
          />
        </Box>

        {/* Tipo de usuario */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "90%",
            marginBottom: 2,
          }}
        >
          <BadgeOutlinedIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <FormControl variant="standard" fullWidth>
            <InputLabel>Tipo de Usuario</InputLabel>
            <Select
              name="user_type"
              value={formData.user_type}
              onChange={handleInput}
            >
              <MenuItem value="Encargado">Encargado</MenuItem>
              <MenuItem value="Profesor">Profesor</MenuItem>
              <MenuItem value="Estudiante">Estudiante</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Cédula (tipo y número) en la misma línea */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "90%",
            marginBottom: 2,
            gap: 1,
          }}
        >
          <BadgeOutlinedIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          {/* Tipo de Cédula */}
          <FormControl variant="standard" sx={{ minWidth: 80 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="ci_type"
              value={formData.ci_type}
              onChange={handleInput}
            >
              <MenuItem value="V">V</MenuItem>
              <MenuItem value="E">E</MenuItem>
            </Select>
          </FormControl>
          <NumbersOutlinedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          />
          {/* Número de Cédula */}
          <TextField
            fullWidth
            label="Cédula"
            name="ci"
            type="number"
            value={formData.ci}
            onChange={handleInput}
            variant="standard"
          />
        </Box>

        {/* -------------------- FIN CAMPOS AGRUPADOS -------------------- */}

        {/* Teléfono */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "90%",
            marginBottom: 2,
          }}
        >
          <LocalPhoneOutlinedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          />
          <TextField
            fullWidth
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleInput}
            variant="standard"
          />
        </Box>

        {/* Sede */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "90%",
            marginBottom: 2,
          }}
        >
          <LocationCityOutlinedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          />
          <FormControl fullWidth variant="standard">
            <InputLabel>Sede</InputLabel>
            <Select
              name="id_sede"
              value={formData.id_sede}
              onChange={handleInput}
            >
              {sedeOptions &&
                sedeOptions.map((sede) => (
                  <MenuItem key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        {/* Contraseña */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "90%",
            marginBottom: 2,
          }}
        >
          <LockOutlinedIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInput}
            variant="standard"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <p className="text-white">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Inicia sesión
          </Link>
        </p>
        <div className="flex justify-center gap-10 mt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
            disabled={modalState.isOpen && modalState.status === "loading"}
          >
            {modalState.isOpen && modalState.status === "loading"
              ? "Cargando..."
              : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
