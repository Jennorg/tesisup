import { useState, useEffect } from "react";
import axios from "axios";
import handleInputChange from "@/hooks/utils/handleInputChange";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
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
    <div className="flex justify-center items-center min-h-screen w-screen bg-blue-600">
      <div className="flex w-full max-w-lg bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="flex-1">
          <img src="/img/fondo1.jpg" alt="Imagen Login" className="w-full h-full object-cover" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 p-6 text-center">
          <img src="/img/uneg-logo.png" alt="Logo UNEG" className="mx-auto w-24 h-24" />
          <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>

          <div className="flex flex-col text-left">
            <label htmlFor="email" className="text-white font-medium">Usuario</label>
            <input
              className="border rounded px-3 py-2 bg-gray-700 text-white"
              type="email"
              name="email"
              id="email"
              placeholder="Usuario"
              onChange={handleInput}
              required
            />
          </div>

          <div className="flex flex-col text-left">
            <label htmlFor="password" className="text-white font-medium">Contraseña</label>
            <input
              className="border rounded px-3 py-2 bg-gray-700 text-white"
              type="password"
              name="password"
              id="password"
              placeholder="********"
              onChange={handleInput}
              required
            />
          </div>

          <div className="flex justify-between mt-4">
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
    </div>
  );
};

export default Login;