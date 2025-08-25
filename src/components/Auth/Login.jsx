import { useState, useEffect } from "react";
import axios from "axios";
import handleInputChange from "@/hooks/utils/handleInputChange";
import { useNavigate } from "react-router-dom";

import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";

import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/MainPage");
  }, [navigate]);

  const handleInput = (e) => {
    handleInputChange(e, setFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/login", formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login exitoso:", user);
      navigate("/MainPage");
    } catch (err) {
      console.error("Error en login:", err.response?.data || err.message);
      alert("Credenciales inválidas o error del servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-dvw h-dvh bg-gray-800 shadow-lg overflow-hidden">
      <div className="hidden md:flex flex-1">
        <img
          src="/img/fondo1.jpg"
          alt="Imagen Login"
          className="w-full h-full object-cover"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col gap-4 p-6 text-center justify-center align-middle items-center"
      >
        <img
          src="/img/uneg-logo.png"
          alt="Logo UNEG"
          className="mx-auto w-24 h-24"
        />
        <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>

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

        <div className="flex gap-10 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
