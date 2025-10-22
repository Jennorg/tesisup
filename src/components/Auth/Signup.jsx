import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import handleInputChange from "@/hooks/utils/handleInputChange";

const VITE_API_URL = import.meta.env.VITE_API_URL;
import LoadingModal from "@/hooks/Modals/LoadingModal";

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

  // sedeOptions ahora es un array de objetos { id, nombre }
  const [sedeOptions, setSedeOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });
  const navigate = useNavigate();

  const fetchSedes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sede`);
      setSedeOptions(response.data.data);
      console.log("Sedes obtenidas:", response.data.data);
    } catch (error) {
      console.error("Error fetching sedes:", error);
      setSedeOptions([]);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
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
      telefono: formData.telefono,
      id_sede: parseInt(formData.id_sede), // Guardar como número
    };

    delete payload.user_type;

    console.log("Datos enviados al servidor:", payload);

    setModalState({
      isOpen: true,
      status: "loading",
      message: "Registrando usuario...",
    });

    axios
      .post(`${import.meta.env.VITE_API_URL}/${endpoint}`, payload)
      .then((res) => {
        console.log("Respuesta del servidor:", res.data);
        setModalState({
          isOpen: true,
          status: "success",
          message: `${formData.user_type} creado correctamente`,
        });
      })
      .catch((err) => {
        console.error("Error al enviar:", err);
        setModalState({
          isOpen: true,
          status: "error",
          message:
            err.response?.data?.message ||
            `Error al registrar ${formData.user_type}`,
        });
      });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleCloseModal = useCallback(() => {
    if (modalState.status === "success") {
      navigate("/login");
    }
    // Siempre cierra el modal, sin importar el estado
    setModalState({ isOpen: false, status: "loading", message: "" });
  }, [modalState.status, navigate]);

  return (
    <div className="flex w-dvw h-dvh bg-gray-800 shadow-lg overflow-hidden">
      <div className="hidden md:flex">
        <img
          src="/img/fondo1.jpg"
          alt="Imagen Login"
          className="w-full h-full object-cover"
        />
      </div>
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleCloseModal}
      />
      <form
        className="p-6 bg-gray-800 shadow-lg flex flex-col gap-6 w-full text-center justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          validateForm();
        }}
      >
        <img
          src="/img/uneg-logo.png"
          alt="Logo UNEG"
          className="mx-auto w-24 h-24"
        />
        <h1 className="text-2xl font-bold text-white">Registro</h1>
        <div className="grid grid-cols-2 gap-4">
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
              marginBottom: 2,
            }}
          >
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
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
              marginBottom: 2,
            }}
          >
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
        </div>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "100%",
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

        <Box sx={{ display: "flex", alignItems: "flex-end", flexShrink: 0 }}>
          <BadgeOutlinedIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <FormControl variant="standard">
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

        <div className="flex justify-center items-center gap-4">
          <Box sx={{ display: "flex", alignItems: "flex-end", flexShrink: 0 }}>
            <BadgeOutlinedIcon
              sx={{ color: "action.active", mr: 1, my: 0.5 }}
            />
            <FormControl variant="standard">
              <Select
                name="ci_type"
                value={formData.ci_type}
                onChange={handleInput}
              >
                <MenuItem value="V">V</MenuItem>
                <MenuItem value="E">E</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              flex: 1,
              marginBottom: 2,
            }}
          >
            <NumbersOutlinedIcon
              sx={{ color: "action.active", mr: 1, my: 0.5 }}
            />
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
        </div>

        <div className="flex gap-4">
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
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
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              width: "100%",
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
        </div>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            width: "100%",
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
