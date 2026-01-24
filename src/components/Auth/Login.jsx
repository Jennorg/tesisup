import { useState, useCallback } from "react";
import authService from "@/services/auth.service";
import handleInputChange from "@/hooks/utils/handleInputChange";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingModal from "@/hooks/Modals/LoadingModal";

import { TextField, Box } from "@mui/material";

import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

/**
 * Componente de Inicio de Sesión (Login)
 * Permite a los usuarios autenticarse ingresando correo y contraseña.
 * Gestiona el estado de carga y errores mediante un modal interactivo.
 */
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estado para controlar el modal de carga/éxito/error
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  // Alternar visibilidad de contraseña
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Manejador genérico de cambios en inputs
  const handleInput = (e) => {
    handleInputChange(e, setFormData);
  };

  /**
   * Maneja el envío del formulario.
   * Llama al servicio de autenticación y gestiona la respuesta.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalState({
      isOpen: true,
      status: "loading",
      message: "Iniciando sesión...",
    });

    try {
      const data = await authService.login(formData);
      const { token, user } = data;
      // Actualizar contexto global de autenticación
      login(user, token);

      console.log("Login exitoso:", user);
      setModalState({
        isOpen: true,
        status: "success",
        message: "¡Bienvenido!",
      });
    } catch (err) {
      console.error("Error en login:", err.response?.data.error || err.message);
      setModalState({
        isOpen: true,
        status: "error",
        message: "Credenciales inválidas o error del servidor",
      });
    }
  };

  /**
   * Callback para cerrar el modal.
   * Si el login fue exitoso, redirige al usuario a la página principal.
   */
  const handleCloseModal = useCallback(() => {
    if (modalState.status === "success") {
      navigate("/");
    }
    // Siempre cierra el modal, sin importar el estado
    setModalState({ isOpen: false, status: "loading", message: "" });
  }, [modalState.status, navigate]);

  return (
    <div className="flex w-dvw h-dvh bg-[var(--background-paper)] shadow-lg overflow-hidden">
      {/* Sección con imagen de fondo (oculta en móviles) */}
      <div className="hidden md:flex flex-1">
        <img
          src="/img/fondo1.jpg"
          alt="Imagen Login"
          className="w-full h-full object-cover overflow-clip"
        />
      </div>

      {/* Modal de estado */}
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleCloseModal}
      />

      {/* Formulario de Login */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col gap-4 p-6 text-center justify-center align-middle items-center"
      >
        <img
          src="/img/uneg-logo.png"
          alt="Logo UNEG"
          className="mx-auto w-24 h-24"
        />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Iniciar sesión
        </h1>

        {/* Campo Email */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "90%",
            marginBottom: 2,
          }}
        >
          <PersonOutlineOutlinedIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          />
          <TextField
            fullWidth
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInput}
            variant="standard"
          />
        </Box>

        {/* Campo Contraseña */}
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

        <p className="text-[var(--text-primary)]">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/signup"
            className="text-[var(--primary-main)] hover:underline"
          >
            Regístrate
          </Link>
        </p>

        <div className="flex justify-center gap-10 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-[var(--error-main)] text-[var(--primary-contrast-text)] rounded"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--success-main)] text-[var(--primary-contrast-text)] rounded"
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

export default Login;
