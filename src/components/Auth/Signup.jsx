import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import handleInputChange from "@/hooks/utils/handleInputChange";

const VITE_API_URL = import.meta.env.VITE_API_URL;

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
  });

  // sedeOptions ahora es un array de objetos { id, nombre }
  const [sedeOptions, setSedeOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchSedes = async () => {
    try {
      const res = await axios.get(`${VITE_API_URL}/sede/`);
      let sedesArray = Array.isArray(res.data)
        ? res.data
        : res.data.sedes || res.data.data || [];
      setSedeOptions(sedesArray);
    } catch (error) {
      console.error("Error fetching sedes:", error);
      setSedeOptions([]);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const payload = {
      ...formData,
      ci: parseInt(formData.ci),
      telefono: formData.telefono,
      id_sede: parseInt(formData.id_sede), // Guardar como número
    };

    console.log("Datos enviados al servidor:", payload);

    axios
      .post(`${VITE_API_URL}/encargado`, payload)
      .then((res) => {
        console.log("Respuesta del servidor:", res.data);
        setMensaje(" Encargado creado correctamente");
        setTimeout(() => {
          navigate("/mainPage");
        }, 1200);
      })
      .catch((err) => {
        console.error("Error al enviar:", err);
        setMensaje(
          err.response?.data?.message || " Error al registrar encargado"
        );
      });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Estilos consistentes para los campos de texto
  const textFieldStyles = {
    '& .MuiInputLabel-root': { color: 'white' },
    '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255, 255, 255, 0.42)' },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'white' },
    '& .MuiInput-underline:after': { borderBottomColor: '#10b981' },
    '& .MuiInputBase-input': { color: 'white' }
  };

  const selectStyles = {
    '& .MuiSelect-select': { color: 'white' },
    '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255, 255, 255, 0.42)' },
    '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'white' },
    '& .MuiInput-underline:after': { borderBottomColor: '#10b981' },
    '& .MuiSvgIcon-root': { color: 'white' }
  };

  return (
    <div className="flex w-dvw h-dvh bg-gray-800 shadow-lg overflow-hidden">
      {/* Sección izquierda con imagen de fondo */}
      <div className="hidden md:flex md:w-1/3 lg:w-2/5 xl:w-1/3">
        <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
          {!imageError && (
            <img
              src="/img/fondo1.jpg"
              alt="Imagen Login"
              className="w-full h-full object-cover object-center"
              style={{
                objectPosition: 'center center',
                imageRendering: 'high-quality'
              }}
              onError={() => {
                console.log('Error loading image');
                setImageError(true);
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20"></div>
        </div>
      </div>
      
      {/* Sección derecha con formulario */}
      <div className="flex flex-col w-full md:w-2/3 lg:w-3/5 xl:w-2/3 bg-gray-800">
        {/* Header para móviles */}
        <div className="md:hidden bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-center">
          <img
            src="/img/uneg-logo.png"
            alt="Logo UNEG"
            className="mx-auto w-16 h-16 mb-2"
          />
          <h1 className="text-xl font-bold text-white">Registro</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form
            className="p-6 md:p-8 lg:p-10 flex flex-col gap-6 w-full text-center min-h-full"
            onSubmit={(e) => {
              e.preventDefault();
              validateForm();
            }}
          >
        <div className="mb-8 hidden md:block">
          <img
            src="/img/uneg-logo.png"
            alt="Logo UNEG"
            className="mx-auto w-20 h-20 mb-4"
          />
          <h1 className="text-3xl font-bold text-white">Registro</h1>
          <p className="text-gray-300 mt-2">Crea tu cuenta para acceder al sistema</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              sx={textFieldStyles}
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
              sx={textFieldStyles}
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
            sx={textFieldStyles}
          />
        </Box>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Box sx={{ display: "flex", alignItems: "flex-end", flexShrink: 0 }}>
            <BadgeOutlinedIcon
              sx={{ color: "action.active", mr: 1, my: 0.5 }}
            />
            <FormControl variant="standard" sx={selectStyles}>
              <Select
                name="ci_type"
                value={formData.ci_type}
                onChange={handleInput}
                sx={selectStyles}
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
              sx={textFieldStyles}
            />
          </Box>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
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
              sx={textFieldStyles}
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
            <FormControl fullWidth variant="standard" sx={selectStyles}>
              <InputLabel sx={{ color: 'white' }}>Sede</InputLabel>
              <Select
                name="id_sede"
                value={formData.id_sede}
                onChange={handleInput}
                sx={selectStyles}
              >
                {sedeOptions.map((sede) => (
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
            sx={textFieldStyles}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{ color: 'white' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Continuar
          </button>
        </div>
        
        {/* Mensaje de feedback */}
        {mensaje && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            mensaje.includes('correctamente') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {mensaje}
          </div>
        )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;