import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import handleInputChange from "@/hooks/utils/handleInputChange";

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

  const [sedeOptions, setSedeOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const fetchSedes = async () => {
    try {
      setSedeOptions(["Puerto Ordaz", "San Félix", "Ciudad Bolívar"]);
    } catch (error) {
      console.error("Error fetching sedes:", error);
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
      id_sede: parseInt(formData.id_sede),
    };

    console.log("Datos enviados al servidor:", payload);

    axios
      .post("http://localhost:8080/api/encargado", payload)
      .then((res) => {
        console.log("Respuesta del servidor:", res.data);
        setMensaje(" Encargado creado correctamente");
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

  return (
    <div className="grid min-h-screen w-screen bg-blue-600 grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex flex-1">
        <img
          src="/img/fondo1.jpg"
          alt="Imagen Login"
          className="w-full h-full object-cover"
        />
      </div>
      <form
        className="p-6 bg-gray-800 shadow-lg flex flex-col gap-6 w-full text-center"
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
                {sedeOptions.map((sede) => (
                  <MenuItem key={sede} value={sede}>
                    {sede}
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
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
