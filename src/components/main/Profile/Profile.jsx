import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { deepOrange } from "@mui/material/colors";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GavelIcon from "@mui/icons-material/Gavel";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Link from "@mui/material/Link";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const API_URL = import.meta.env.VITE_API_URL;
const VITE_API_URL = API_URL || "http://localhost:8080/api";

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { userType: urlUserType, ci: urlCi } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [sedeData, setSedeData] = useState(null);
  const [tesisAsTutor, setTesisAsTutor] = useState([]);
  const [tesisAsJurado, setTesisAsJurado] = useState([]);
  const [allTesisData, setAllTesisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingUserType, setViewingUserType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !token) {
        setError("No hay usuario autenticado");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Si hay parámetros en la URL, usar esos; si no, usar el usuario autenticado
        const targetCi = urlCi || user.ci;
        const targetUserType = urlUserType?.toLowerCase() || user.user_type?.toLowerCase();

        // Determinar el endpoint según el tipo de usuario
        let endpoint = "";
        const userType = targetUserType;

        setViewingUserType(userType);

        let data = null;

        if (userType === "estudiante") {
          // Intentar primero con el endpoint específico
          try {
            const response = await axios.get(
              `${VITE_API_URL}/estudiantes/${targetCi}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            data = response.data.data || response.data;
          } catch (err) {
            // Si falla, obtener todos los estudiantes y buscar por CI
            console.log("Endpoint específico falló, buscando en lista completa...");
            const estudiantesRes = await axios.get(`${VITE_API_URL}/estudiantes`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const estudiantes = estudiantesRes.data.data || estudiantesRes.data || [];
            data = estudiantes.find((e) => String(e.ci) === String(targetCi));
            if (!data) {
              throw new Error("Estudiante no encontrado");
            }
          }
        } else if (userType === "profesor") {
          const response = await axios.get(
            `${VITE_API_URL}/profesor/${targetCi}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          data = response.data.data || response.data;
        } else if (userType === "encargado") {
          const response = await axios.get(
            `${VITE_API_URL}/encargado/${targetCi}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          data = response.data.data || response.data;
        } else {
          throw new Error("Tipo de usuario no válido");
        }

        setProfileData(data);

        // Si es encargado, obtener información de la sede
        if (userType === "encargado" && data.id_sede) {
          try {
            const sedeResponse = await axios.get(
              `${VITE_API_URL}/sede/search/${data.id_sede}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setSedeData(sedeResponse.data.data || sedeResponse.data);
          } catch (sedeError) {
            console.error("Error al obtener información de la sede:", sedeError);
          }
        }

        // Si es profesor, obtener todas las tesis y datos relacionados
        if (userType === "profesor") {
          try {
            // Obtener todas las tesis con paginación (obtener todas las páginas)
            let allTesis = [];
            let page = 1;
            let hasMore = true;
            const limit = 100; // Obtener 100 por página para minimizar requests

            while (hasMore) {
              const tesisResponse = await axios.get(`${VITE_API_URL}/tesis`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                params: {
                  page,
                  limit,
                },
              });

              const responseData = tesisResponse.data;
              const tesisPage = responseData.data || [];
              allTesis = [...allTesis, ...tesisPage];

              // Verificar si hay más páginas
              const total = responseData.total || 0;
              hasMore = page * limit < total;
              page++;
            }

            // Obtener datos relacionados
            const [profesoresRes, encargadosRes, estudiantesRes, sedesRes] =
              await Promise.all([
                axios.get(`${VITE_API_URL}/profesor`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }),
                axios.get(`${VITE_API_URL}/encargado`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }),
                axios.get(`${VITE_API_URL}/estudiantes`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }),
                axios.get(`${VITE_API_URL}/sede`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }),
              ]);

            const profesores = profesoresRes.data.data || profesoresRes.data || [];
            const encargados = encargadosRes.data.data || encargadosRes.data || [];
            const estudiantes = estudiantesRes.data.data || estudiantesRes.data || [];
            const sedes = sedesRes.data.data || sedesRes.data || [];

            // Enriquecer datos de tesis con información relacionada
            const enrichedTesis = allTesis.map((tesis) => {
              // Las tesis ya vienen con autores y jurados desde el backend
              // Solo necesitamos enriquecer con datos adicionales si es necesario
              const tutor = profesores.find(
                (p) => String(p.ci) === String(tesis.id_tutor)
              );
              const encargado = encargados.find(
                (e) => String(e.ci) === String(tesis.id_encargado)
              );
              const sede = sedes.find((s) => s.id === tesis.id_sede);

              return {
                ...tesis,
                tutor,
                encargado,
                sede_nombre: sede?.nombre || "",
              };
            });

            setAllTesisData(enrichedTesis);

            // Filtrar tesis donde el profesor es tutor
            const tutorTesis = enrichedTesis.filter(
              (t) => String(t.id_tutor) === String(targetCi)
            );
            setTesisAsTutor(tutorTesis);

            // Filtrar tesis donde el profesor es jurado
            // El backend devuelve un array 'jurados' con objetos { ci, nombre, apellido, ci_type }
            const juradoTesis = enrichedTesis.filter((t) => {
              if (t.jurados && Array.isArray(t.jurados)) {
                return t.jurados.some(
                  (jurado) => String(jurado.ci) === String(targetCi)
                );
              }
              return false;
            });
            setTesisAsJurado(juradoTesis);
          } catch (tesisError) {
            console.error("Error al obtener tesis del profesor:", tesisError);
            setError("Error al cargar las tesis del profesor");
          }
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Error al cargar el perfil"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, token, urlUserType, urlCi]);

  const getTypeLabel = (type) => {
    const types = {
      estudiante: "Estudiante",
      profesor: "Profesor",
      encargado: "Encargado",
    };
    return types[type?.toLowerCase()] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      estudiante: "primary",
      profesor: "success",
      encargado: "warning",
    };
    return colors[type?.toLowerCase()] || "default";
  };

  // Función helper para navegar al perfil de un usuario
  const navigateToProfile = (ci, userType) => {
    if (ci && userType) {
      navigate(`/profile/${userType}/${ci}`);
    }
  };

  // Función para iniciar edición
  const handleStartEdit = () => {
    if (profileData) {
      setEditData({
        nombre: profileData.nombre || "",
        apellido: profileData.apellido || "",
        email: profileData.email || "",
        telefono: profileData.telefono || "",
      });
      setIsEditing(true);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
    });
  };

  // Función para guardar cambios
  const handleSaveEdit = async () => {
    if (!profileData || !token) return;

    setSaving(true);
    try {
      const targetCi = urlCi || profileData.ci;
      const userType = viewingUserType || profileData.user_type?.toLowerCase();

      if (userType === "profesor") {
        // Preparar payload con todos los campos necesarios
        const payload = {
          ci: parseInt(targetCi),
          ci_type: profileData.ci_type || "V",
          nombre: String(editData.nombre),
          apellido: String(editData.apellido),
          email: String(editData.email || ""),
          telefono: String(editData.telefono || ""),
        };

        console.log("Enviando datos de actualización:", payload);

        const response = await axios.put(
          `${VITE_API_URL}/profesor/${targetCi}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Respuesta del servidor:", response.data);

        // Actualizar los datos del perfil
        setProfileData({
          ...profileData,
          nombre: editData.nombre,
          apellido: editData.apellido,
          email: editData.email,
          telefono: editData.telefono,
        });

        setIsEditing(false);
        setError(null);
      } else if (userType === "estudiante") {
        // Preparar payload para estudiante
        const payload = {
          ci: parseInt(targetCi),
          ci_type: profileData.ci_type || "V",
          nombre: String(editData.nombre),
          apellido: String(editData.apellido),
          email: String(editData.email || ""),
          telefono: String(editData.telefono || ""),
        };

        console.log("Enviando datos de actualización (estudiante):", payload);

        const response = await axios.put(
          `${VITE_API_URL}/estudiantes/${targetCi}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Respuesta del servidor (estudiante):", response.data);

        // Actualizar los datos del perfil
        setProfileData({
          ...profileData,
          nombre: editData.nombre,
          apellido: editData.apellido,
          email: editData.email,
          telefono: editData.telefono,
        });

        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      console.error("Detalles del error:", err.response?.data);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.data ||
          "Error al guardar los cambios"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExcel = () => {
    const displayData = profileData || user;
    
    // Combinar todas las tesis con su rol
    const allTesisWithRole = [
      ...tesisAsTutor.map((t) => ({ ...t, rol: "Tutor" })),
      ...tesisAsJurado.map((t) => ({ ...t, rol: "Jurado" })),
    ];
    // Preparar datos para Excel con columnas ordenadas y formateo
    const headers = [
      "Título",
      "ID Tesis",
      "Rol",
      "Estado",
      "Fecha",
      "Autores (nombres)",
      "Autores (cédulas)",
      "Jurados (nombres)",
      "Jurados (cédulas)",
      "Sede",
    ];

    const rows = [headers];

    allTesisWithRole.forEach((tesis) => {
      const nombresAutores = tesis.autores && Array.isArray(tesis.autores)
        ? tesis.autores
            .map((a) => (a.nombre && a.apellido ? `${a.nombre} ${a.apellido}` : a.nombre || a.nombre_completo || ""))
            .filter(Boolean)
            .join(", ")
        : "";

      const cedulasAutores = tesis.autores && Array.isArray(tesis.autores)
        ? tesis.autores
            .map((a) => {
              const ciType = a.ci_type || "V";
              return a.ci ? `${ciType}-${a.ci}` : "";
            })
            .filter(Boolean)
            .join(", ")
        : "";

      const nombresJurados = tesis.jurados && Array.isArray(tesis.jurados)
        ? tesis.jurados
            .map((j) => (j.nombre && j.apellido ? `${j.nombre} ${j.apellido}` : j.nombre || j.nombre_completo || ""))
            .filter(Boolean)
            .join(", ")
        : "";

      const cedulasJurados = tesis.jurados && Array.isArray(tesis.jurados)
        ? tesis.jurados
            .map((j) => {
              const ciType = j.ci_type || "V";
              return j.ci ? `${ciType}-${j.ci}` : "";
            })
            .filter(Boolean)
            .join(", ")
        : "";

      // Fecha: si existe, conviértela a objeto Date para que Excel la reconozca
      const fechaVal = tesis.fecha ? dayjs(tesis.fecha).isValid() ? dayjs(tesis.fecha).toDate() : null : null;

      rows.push([
        tesis.nombre || tesis.titulo || "",
        tesis.id_tesis || tesis.id || "",
        tesis.rol || "",
        tesis.estado ? tesis.estado.charAt(0).toUpperCase() + tesis.estado.slice(1).toLowerCase() : "",
        fechaVal || "",
        nombresAutores,
        cedulasAutores,
        nombresJurados,
        cedulasJurados,
        tesis.sede_nombre || tesis.sede || "",
      ]);
    });

    // Crear worksheet desde AOA (array of arrays) para controlar encabezados y orden
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Establecer anchos de columnas para mejor legibilidad
    ws["!cols"] = [
      { wch: 40 }, // Título
      { wch: 12 }, // ID
      { wch: 12 }, // Rol
      { wch: 14 }, // Estado
      { wch: 12 }, // Fecha
      { wch: 30 }, // Autores nombres
      { wch: 20 }, // Autores cédulas
      { wch: 30 }, // Jurados nombres
      { wch: 20 }, // Jurados cédulas
      { wch: 20 }, // Sede
    ];

    // Aplicar estilos de encabezado (fondo, color, negrita) y bordes a toda la tabla.
    const headerFill = { patternType: "solid", fgColor: { rgb: "FF2F6BFF" } }; // azul
    const headerFont = { bold: true, color: { rgb: "FFFFFFFF" }, sz: 12 };
    const thinBorder = {
      top: { style: "thin", color: { rgb: "FF000000" } },
      bottom: { style: "thin", color: { rgb: "FF000000" } },
      left: { style: "thin", color: { rgb: "FF000000" } },
      right: { style: "thin", color: { rgb: "FF000000" } },
    };

    const totalRows = rows.length;
    const totalCols = headers.length;

    for (let r = 0; r < totalRows; ++r) {
      for (let c = 0; c < totalCols; ++c) {
        const addr = XLSX.utils.encode_cell({ c, r });
        if (!ws[addr]) continue;

        // Asegurarnos de no perder estilos previos
        ws[addr].s = ws[addr].s || {};

        // Encabezado: fondo y fuente blanca centrada
        if (r === 0) {
          ws[addr].s.font = headerFont;
          ws[addr].s.fill = headerFill;
          ws[addr].s.alignment = { horizontal: "center", vertical: "center", wrapText: true };
        } else {
          // Celdas de datos: alineación y ajuste para columnas largas
          ws[addr].s.alignment = { horizontal: c === 0 || c === 5 || c === 6 || c === 7 ? "left" : "center", vertical: "center", wrapText: true };
          // Si es columna Fecha (índice 4), forzar formato de fecha
          if (c === 4 && ws[addr].v instanceof Date) {
            ws[addr].t = "d";
            ws[addr].z = "DD/MM/YYYY";
          }
        }

        // Añadir bordes a todas las celdas
        ws[addr].s.border = thinBorder;
      }
    }

    // Autofiltrar y congelar fila de encabezado
    ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1` };

    // Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tesis");

    // Views: congelar primera fila
    wb.Workbook = wb.Workbook || {};
    wb.Workbook.Views = wb.Workbook.Views || [];
    wb.Workbook.Views.push({ xSplit: 0, ySplit: 1, topLeftCell: "A2", activeTab: 0 });

    // Generar nombre del archivo
    const fileName = `Tesis_${displayData?.nombre || "Profesor"}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

    // Escribir archivo
    XLSX.writeFile(wb, fileName);
  };


  if (loading && !profileData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profileData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
          aria-label="volver"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  const displayData = profileData || user;
  const avatarLetter = displayData?.nombre
    ? displayData.nombre.charAt(0).toUpperCase()
    : "U";

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
      {/* Botón de regreso */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
        aria-label="volver"
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Card principal del perfil */}
      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header del perfil con avatar */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${
              (viewingUserType || user?.user_type?.toLowerCase()) === "estudiante"
                ? "#1976d2"
                : (viewingUserType || user?.user_type?.toLowerCase()) === "profesor"
                ? "#2e7d32"
                : "#ed6c02"
            } 0%, ${
              (viewingUserType || user?.user_type?.toLowerCase()) === "estudiante"
                ? "#42a5f5"
                : (viewingUserType || user?.user_type?.toLowerCase()) === "profesor"
                ? "#66bb6a"
                : "#ff9800"
            } 100%)`,
            p: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 3,
          }}
        >
          <Avatar
            sx={{
              width: { xs: 100, md: 120 },
              height: { xs: 100, md: 120 },
              bgcolor: "white",
              color: "primary.main",
              fontSize: { xs: "3rem", md: "4rem" },
              border: "4px solid white",
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box sx={{ flex: 1, color: "white" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", mb: 1 }}
              component="h1"
            >
              {displayData?.nombre} {displayData?.apellido}
            </Typography>
            <Chip
              label={getTypeLabel(viewingUserType || user?.user_type)}
              color={getTypeColor(viewingUserType || user?.user_type)}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: "bold",
              }}
            />
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "background.default",
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <PersonIcon color="primary" />
                    Información Personal
                  </Typography>
                  {/* Botón de editar solo para encargados viendo perfil de profesor o estudiante */}
                  {user?.user_type?.toLowerCase() === "encargado" &&
                    ["profesor", "estudiante"].includes(
                      (viewingUserType || profileData?.user_type?.toLowerCase())
                    ) && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {!isEditing ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={handleStartEdit}
                          >
                            Editar
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              startIcon={<SaveIcon />}
                              onClick={handleSaveEdit}
                              disabled={saving}
                            >
                              {saving ? "Guardando..." : "Guardar"}
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              startIcon={<CancelIcon />}
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </Box>
                    )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BadgeIcon sx={{ color: "text.secondary" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Cédula de Identidad
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {displayData?.ci_type || "V"}-{displayData?.ci}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <EmailIcon sx={{ color: "text.secondary", mt: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Correo Electrónico
                        </Typography>
                        {isEditing &&
                        user?.user_type?.toLowerCase() === "encargado" &&
                        ["profesor", "estudiante"].includes(
                          (viewingUserType || profileData?.user_type?.toLowerCase())
                        ) ? (
                          <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={editData.email}
                            onChange={(e) =>
                              setEditData({ ...editData, email: e.target.value })
                            }
                            sx={{ mt: 0.5 }}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight="medium">
                            {displayData?.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <PhoneIcon sx={{ color: "text.secondary", mt: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Teléfono
                        </Typography>
                        {isEditing &&
                        user?.user_type?.toLowerCase() === "encargado" &&
                        ["profesor", "estudiante"].includes(
                          (viewingUserType || profileData?.user_type?.toLowerCase())
                        ) ? (
                          <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={editData.telefono}
                            onChange={(e) =>
                              setEditData({ ...editData, telefono: e.target.value })
                            }
                            sx={{ mt: 0.5 }}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight="medium">
                            {displayData?.telefono}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Campos de nombre y apellido editables */}
                  {isEditing &&
                    user?.user_type?.toLowerCase() === "encargado" &&
                    ["profesor", "estudiante"].includes(
                      (viewingUserType || profileData?.user_type?.toLowerCase())
                    ) && (
                      <>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            label="Nombre"
                            variant="outlined"
                            value={editData.nombre}
                            onChange={(e) =>
                              setEditData({ ...editData, nombre: e.target.value })
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            label="Apellido"
                            variant="outlined"
                            value={editData.apellido}
                            onChange={(e) =>
                              setEditData({ ...editData, apellido: e.target.value })
                            }
                          />
                        </Grid>
                      </>
                    )}
                </Grid>
              </Paper>
            </Grid>

            {/* Información específica según el tipo de usuario */}
            {(viewingUserType || user?.user_type?.toLowerCase()) === "encargado" && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "background.default",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <BusinessIcon color="primary" />
                    Información de Sede
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {sedeData ? (
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {sedeData.nombre}
                      </Typography>
                      {sedeData.direccion && (
                        <Typography variant="body2" color="text.secondary">
                          {sedeData.direccion}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Cargando información de la sede...
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {(viewingUserType || user?.user_type?.toLowerCase()) === "estudiante" && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "background.default",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <SchoolIcon color="primary" />
                    Información Académica
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Estudiante registrado en el sistema
                  </Typography>
                </Paper>
              </Grid>
            )}

            {(viewingUserType || user?.user_type?.toLowerCase()) === "profesor" && (
              <>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      Tesis en las que ha participado
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadExcel}
                      disabled={
                        tesisAsTutor.length === 0 && tesisAsJurado.length === 0
                      }
                    >
                      Descargar Excel
                    </Button>
                  </Box>
                </Grid>

                {/* Tesis como Tutor */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "background.default",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <AssignmentIcon color="primary" />
                      Tesis como Tutor ({tesisAsTutor.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer sx={{ maxHeight: 300, minHeight: 140 }}>
                      <Table size="medium" sx={{ tableLayout: "fixed" }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: "40%" }}>
                              <strong>Título</strong>
                            </TableCell>
                            <TableCell sx={{ width: "15%" }}>
                              <strong>Estado</strong>
                            </TableCell>
                            <TableCell sx={{ width: "15%" }}>
                              <strong>Fecha</strong>
                            </TableCell>
                            <TableCell sx={{ width: "30%" }}>
                              <strong>Autores</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tesisAsTutor.length > 0 ? (
                            tesisAsTutor.map((tesis) => (
                              <TableRow key={tesis.id_tesis || tesis.id} hover>
                                <TableCell
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {tesis.nombre || tesis.titulo || "Sin título"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      tesis.estado
                                        ? tesis.estado.charAt(0).toUpperCase() +
                                          tesis.estado.slice(1).toLowerCase()
                                        : "N/A"
                                    }
                                    size="small"
                                    color={
                                      tesis.estado?.toLowerCase() === "aprobado" ||
                                      tesis.estado?.toLowerCase() === "aprobada"
                                        ? "success"
                                        : tesis.estado?.toLowerCase() === "rechazado" ||
                                          tesis.estado?.toLowerCase() === "rechazada"
                                        ? "error"
                                        : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {tesis.fecha
                                    ? dayjs(tesis.fecha).format("DD/MM/YYYY")
                                    : "N/A"}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {tesis.autores && Array.isArray(tesis.autores) && tesis.autores.length > 0 ? (
                                    <>
                                      {tesis.autores.map((a, idx) => (
                                        <React.Fragment key={idx}>
                                          {a.ci ? (
                                            <Link
                                              component="button"
                                              variant="body2"
                                              onClick={() =>
                                                navigateToProfile(a.ci, "estudiante")
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                textDecoration: "none",
                                                "&:hover": {
                                                  textDecoration: "underline",
                                                },
                                              }}
                                            >
                                              {a.nombre && a.apellido
                                                ? `${a.nombre} ${a.apellido}`
                                                : a.nombre || a.nombre_completo || "N/A"}
                                            </Link>
                                          ) : (
                                            <span>
                                              {a.nombre && a.apellido
                                                ? `${a.nombre} ${a.apellido}`
                                                : a.nombre || a.nombre_completo || "N/A"}
                                            </span>
                                          )}
                                          {idx < tesis.autores.length - 1 && ", "}
                                        </React.Fragment>
                                      ))}
                                    </>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                                No hay tesis registradas como tutor
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>

                {/* Tesis como Jurado */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      bgcolor: "background.default",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <GavelIcon color="primary" />
                      Tesis como Jurado ({tesisAsJurado.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer sx={{ maxHeight: 300, minHeight: 140 }}>
                      <Table size="medium" sx={{ tableLayout: "fixed" }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ width: "40%" }}>
                              <strong>Título</strong>
                            </TableCell>
                            <TableCell sx={{ width: "15%" }}>
                              <strong>Estado</strong>
                            </TableCell>
                            <TableCell sx={{ width: "15%" }}>
                              <strong>Fecha</strong>
                            </TableCell>
                            <TableCell sx={{ width: "30%" }}>
                              <strong>Autores</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tesisAsJurado.length > 0 ? (
                            tesisAsJurado.map((tesis) => (
                              <TableRow key={tesis.id_tesis || tesis.id} hover>
                                <TableCell
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {tesis.nombre || tesis.titulo || "Sin título"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      tesis.estado
                                        ? tesis.estado.charAt(0).toUpperCase() +
                                          tesis.estado.slice(1).toLowerCase()
                                        : "N/A"
                                    }
                                    size="small"
                                    color={
                                      tesis.estado?.toLowerCase() === "aprobado" ||
                                      tesis.estado?.toLowerCase() === "aprobada"
                                        ? "success"
                                        : tesis.estado?.toLowerCase() === "rechazado" ||
                                          tesis.estado?.toLowerCase() === "rechazada"
                                        ? "error"
                                        : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {tesis.fecha
                                    ? dayjs(tesis.fecha).format("DD/MM/YYYY")
                                    : "N/A"}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {tesis.autores && Array.isArray(tesis.autores) && tesis.autores.length > 0 ? (
                                    <>
                                      {tesis.autores.map((a, idx) => (
                                        <React.Fragment key={idx}>
                                          {a.ci ? (
                                            <Link
                                              component="button"
                                              variant="body2"
                                              onClick={() =>
                                                navigateToProfile(a.ci, "estudiante")
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                textDecoration: "none",
                                                "&:hover": {
                                                  textDecoration: "underline",
                                                },
                                              }}
                                            >
                                              {a.nombre && a.apellido
                                                ? `${a.nombre} ${a.apellido}`
                                                : a.nombre || a.nombre_completo || "N/A"}
                                            </Link>
                                          ) : (
                                            <span>
                                              {a.nombre && a.apellido
                                                ? `${a.nombre} ${a.apellido}`
                                                : a.nombre || a.nombre_completo || "N/A"}
                                            </span>
                                          )}
                                          {idx < tesis.autores.length - 1 && ", "}
                                        </React.Fragment>
                                      ))}
                                    </>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                                No hay tesis registradas como jurado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;

