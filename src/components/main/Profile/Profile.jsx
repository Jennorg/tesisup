import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import userService from "@/services/user.service";
import tesisService from "@/services/tesis.service";
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
  useMediaQuery,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

/**
 * Componente de Perfil de Usuario
 * Muestra información detallada del usuario (estudiante, profesor, encargado).
 * Permite editar información y, en caso de profesores, ver y descargar tesis relacionadas.
 */
const Profile = () => {
  const theme = useTheme();
  // MediaQuery para diseño responsivo
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const { user, token } = useAuth();
  const navigate = useNavigate();
  // Obtener parámetros de URL para ver perfil de otro usuario
  const { userType: urlUserType, ci: urlCi } = useParams();

  // Estados de datos
  const [profileData, setProfileData] = useState(null);
  const [sedeData, setSedeData] = useState(null);
  const [tesisAsTutor, setTesisAsTutor] = useState([]);
  const [tesisAsJurado, setTesisAsJurado] = useState([]);
  const [allTesisData, setAllTesisData] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [loadingTesis, setLoadingTesis] = useState(false);
  const [error, setError] = useState(null);
  const [viewingUserType, setViewingUserType] = useState(null);

  // Estados de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });
  const [saving, setSaving] = useState(false);

  // Control de tooltip en móviles
  const [openTitleTooltip, setOpenTitleTooltip] = useState(null);
  const tooltipTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }
    };
  }, []);

  const showTitleTooltip = (id) => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }
    setOpenTitleTooltip(id);
    tooltipTimerRef.current = setTimeout(() => {
      setOpenTitleTooltip(null);
      tooltipTimerRef.current = null;
    }, 3500);
  };

  // Cerrar tooltip al hacer clic fuera
  useEffect(() => {
    if (openTitleTooltip == null) return;

    const onPointerDown = (e) => {
      try {
        const target = e.target;
        const selector = `[data-tooltip-id="${openTitleTooltip}"]`;
        if (target && target.closest && target.closest(selector)) {
          return;
        }
      } catch (err) {
        // Ignorar errores
      }
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = null;
      }
      setOpenTitleTooltip(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openTitleTooltip]);

  // Cargar datos del perfil
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !token) {
        setError("No hay usuario autenticado");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const targetCi = urlCi || user.ci;
        const targetUserType =
          urlUserType?.toLowerCase() || user.user_type?.toLowerCase();

        let endpoint = "";
        const userType = targetUserType;

        setViewingUserType(userType);

        let data = null;

        if (userType === "estudiante") {
          data = await userService.getByCi("estudiante", targetCi);
        } else if (userType === "profesor") {
          data = await userService.getByCi("profesor", targetCi);
        } else if (userType === "encargado") {
          data = await userService.getByCi("encargado", targetCi);
        } else {
          throw new Error("Tipo de usuario no válido");
        }

        setProfileData(data);

        // Cargar datos de sede para encargados
        if (userType === "encargado" && data.id_sede) {
          try {
            const sedeData = await userService.getSedeById(data.id_sede);
            setSedeData(sedeData);
          } catch (sedeError) {
            console.error(
              "Error al obtener información de la sede:",
              sedeError,
            );
          }
        }

        // Para profesores, cargar tesis asociadas
        if (userType === "profesor") {
          setLoadingTesis(true);
          try {
            let allTesis = [];
            let page = 1;
            let hasMore = true;
            const limit = 100;

            // Cargar todas las páginas de tesis
            while (hasMore) {
              const responseData = await tesisService.getAll({ page, limit });
              const tesisPage = responseData.data || [];
              allTesis = [...allTesis, ...tesisPage];

              const total = responseData.total || 0;
              hasMore = page * limit < total;
              page++;
            }

            const [profesores, encargados, estudiantes, sedes] =
              await Promise.all([
                userService.getProfesores(),
                userService.getEncargados(),
                userService.getEstudiantes(),
                userService.getSedes(),
              ]);

            const profesoresList = profesores.data || profesores;
            const encargadosList = encargados.data || encargados;
            const estudiantesList = estudiantes.data || estudiantes;
            const sedesList = sedes.data || sedes;

            // Enriquecer datos de tesis
            const enrichedTesis = allTesis.map((tesis) => {
              const tutor = profesoresList.find(
                (p) => String(p.ci) === String(tesis.id_tutor),
              );
              const encargado = encargadosList.find(
                (e) => String(e.ci) === String(tesis.id_encargado),
              );
              const sede = sedesList.find((s) => s.id === tesis.id_sede);

              return {
                ...tesis,
                tutor,
                encargado,
                sede_nombre: sede?.nombre || "",
              };
            });

            setAllTesisData(enrichedTesis);

            // Filtrar tesis como tutor
            const tutorTesis = enrichedTesis.filter(
              (t) => String(t.id_tutor) === String(targetCi),
            );
            setTesisAsTutor(tutorTesis);

            // Filtrar tesis como jurado
            const juradoTesis = enrichedTesis.filter((t) => {
              if (t.jurados && Array.isArray(t.jurados)) {
                return t.jurados.some(
                  (jurado) => String(jurado.ci) === String(targetCi),
                );
              }
              return false;
            });
            setTesisAsJurado(juradoTesis);
          } catch (tesisError) {
            console.error("Error al obtener tesis del profesor:", tesisError);
            setError("Error al cargar las tesis del profesor");
          } finally {
            setLoadingTesis(false);
          }
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Error al cargar el perfil",
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

  const navigateToProfile = (ci, userType) => {
    if (ci && userType) {
      navigate(`/profile/${userType}/${ci}`);
    }
  };

  // Manejo de edición
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
    });
  };

  const handleSaveEdit = async () => {
    if (!profileData || !token) return;

    setSaving(true);
    try {
      const targetCi = urlCi || profileData.ci;
      const userType = viewingUserType || profileData.user_type?.toLowerCase();

      if (userType === "profesor" || userType === "estudiante") {
        const payload = {
          ci: parseInt(targetCi),
          ci_type: profileData.ci_type || "V",
          nombre: String(editData.nombre),
          apellido: String(editData.apellido),
          email: String(editData.email || ""),
          telefono: String(editData.telefono || ""),
        };

        console.log(`Enviando datos de actualización (${userType}):`, payload);

        await userService.update(userType, targetCi, payload);

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
          "Error al guardar los cambios",
      );
    } finally {
      setSaving(false);
    }
  };

  // Generar reporte Excel de tesis
  const handleDownloadExcel = () => {
    const displayData = profileData || user;

    const allTesisWithRole = [
      ...tesisAsTutor.map((t) => ({ ...t, rol: "Tutor" })),
      ...tesisAsJurado.map((t) => ({ ...t, rol: "Jurado" })),
    ];

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
      const nombresAutores =
        tesis.autores && Array.isArray(tesis.autores)
          ? tesis.autores
              .map((a) =>
                a.nombre && a.apellido
                  ? `${a.nombre} ${a.apellido}`
                  : a.nombre || a.nombre_completo || "",
              )
              .filter(Boolean)
              .join(", ")
          : "";

      const cedulasAutores =
        tesis.autores && Array.isArray(tesis.autores)
          ? tesis.autores
              .map((a) => {
                const ciType = a.ci_type || "V";
                return a.ci ? `${ciType}-${a.ci}` : "";
              })
              .filter(Boolean)
              .join(", ")
          : "";

      const nombresJurados =
        tesis.jurados && Array.isArray(tesis.jurados)
          ? tesis.jurados
              .map((j) =>
                j.nombre && j.apellido
                  ? `${j.nombre} ${j.apellido}`
                  : j.nombre || j.nombre_completo || "",
              )
              .filter(Boolean)
              .join(", ")
          : "";

      const cedulasJurados =
        tesis.jurados && Array.isArray(tesis.jurados)
          ? tesis.jurados
              .map((j) => {
                const ciType = j.ci_type || "V";
                return j.ci ? `${ciType}-${j.ci}` : "";
              })
              .filter(Boolean)
              .join(", ")
          : "";

      const fechaVal = tesis.fecha
        ? dayjs(tesis.fecha).isValid()
          ? dayjs(tesis.fecha).toDate()
          : null
        : null;

      rows.push([
        tesis.nombre || tesis.titulo || "",
        tesis.id_tesis || tesis.id || "",
        tesis.rol || "",
        tesis.estado
          ? tesis.estado.charAt(0).toUpperCase() +
            tesis.estado.slice(1).toLowerCase()
          : "",
        fechaVal || "",
        nombresAutores,
        cedulasAutores,
        nombresJurados,
        cedulasJurados,
        tesis.sede_nombre || tesis.sede || "",
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

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

    const headerFill = { patternType: "solid", fgColor: { rgb: "FF2F6BFF" } };
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

        ws[addr].s = ws[addr].s || {};

        if (r === 0) {
          ws[addr].s.font = headerFont;
          ws[addr].s.fill = headerFill;
          ws[addr].s.alignment = {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          };
        } else {
          ws[addr].s.alignment = {
            horizontal:
              c === 0 || c === 5 || c === 6 || c === 7 ? "left" : "center",
            vertical: "center",
            wrapText: true,
          };
          if (c === 4 && ws[addr].v instanceof Date) {
            ws[addr].t = "d";
            ws[addr].z = "DD/MM/YYYY";
          }
        }
        ws[addr].s.border = thinBorder;
      }
    }

    ws["!autofilter"] = {
      ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}1`,
    };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tesis");

    wb.Workbook = wb.Workbook || {};
    wb.Workbook.Views = wb.Workbook.Views || [];
    wb.Workbook.Views.push({
      xSplit: 0,
      ySplit: 1,
      topLeftCell: "A2",
      activeTab: 0,
    });

    const fileName = `Tesis_${
      displayData?.nombre || "Profesor"
    }_${dayjs().format("YYYY-MM-DD")}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  if (loading && !profileData) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "1200px", mx: "auto" }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mb: { xs: 1, sm: 2 } }}
          aria-label="volver"
        >
          <ArrowBackIcon />
        </IconButton>

        <Card sx={{ overflow: "visible" }}>
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                gap: { xs: 2, md: 3 },
              }}
            >
              <Skeleton variant="circular" width={120} height={120} />
              <Box sx={{ flex: 1, width: "100%" }}>
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={24}
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                sx={{ mt: 1 }}
              />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="85%" height={20} />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="35%" height={32} />
              <Skeleton
                variant="text"
                width="100%"
                height={20}
                sx={{ mt: 1 }}
              />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          </CardContent>
        </Card>
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
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "1200px", mx: "auto" }}>
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ mb: { xs: 1, sm: 2 } }}
        aria-label="volver"
      >
        <ArrowBackIcon />
      </IconButton>

      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Cabecera del Perfil con degradado dinámico según rol */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${
              (viewingUserType || user?.user_type?.toLowerCase()) ===
              "estudiante"
                ? "#1976d2"
                : (viewingUserType || user?.user_type?.toLowerCase()) ===
                  "profesor"
                ? "#2e7d32"
                : "#ed6c02"
            } 0%, ${
              (viewingUserType || user?.user_type?.toLowerCase()) ===
              "estudiante"
                ? "#42a5f5"
                : (viewingUserType || user?.user_type?.toLowerCase()) ===
                  "profesor"
                ? "#66bb6a"
                : "#ff9800"
            } 100%)`,
            p: { xs: 2, sm: 3, md: 4 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 2, md: 3 },
          }}
        >
          <Avatar
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              bgcolor: "white",
              color: "primary.main",
              fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
              border: "4px solid white",
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box
            sx={{
              flex: 1,
              color: "white",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mb: 1,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
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

        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Sección de Información Personal */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  bgcolor: "background.default",
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 0 },
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    }}
                  >
                    <PersonIcon color="primary" />
                    Información Personal
                  </Typography>
                  {/* Edición habilitada solo para encargados */}
                  {user?.user_type?.toLowerCase() === "encargado" &&
                    ["profesor", "estudiante"].includes(
                      viewingUserType || profileData?.user_type?.toLowerCase(),
                    ) && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          flexDirection: { xs: "column", sm: "row" },
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        {!isEditing ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={handleStartEdit}
                            fullWidth={isXs}
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
                              fullWidth={isXs}
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
                              fullWidth={isXs}
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
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      <EmailIcon sx={{ color: "text.secondary", mt: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Correo Electrónico
                        </Typography>
                        {isEditing &&
                        user?.user_type?.toLowerCase() === "encargado" &&
                        ["profesor", "estudiante"].includes(
                          viewingUserType ||
                            profileData?.user_type?.toLowerCase(),
                        ) ? (
                          <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={editData.email}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                email: e.target.value,
                              })
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
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      <PhoneIcon sx={{ color: "text.secondary", mt: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Teléfono
                        </Typography>
                        {isEditing &&
                        user?.user_type?.toLowerCase() === "encargado" &&
                        ["profesor", "estudiante"].includes(
                          viewingUserType ||
                            profileData?.user_type?.toLowerCase(),
                        ) ? (
                          <TextField
                            fullWidth
                            size="small"
                            variant="outlined"
                            value={editData.telefono}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                telefono: e.target.value,
                              })
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

                  {/* Campos editables para Nombre y Apellido */}
                  {isEditing &&
                    user?.user_type?.toLowerCase() === "encargado" &&
                    ["profesor", "estudiante"].includes(
                      viewingUserType || profileData?.user_type?.toLowerCase(),
                    ) && (
                      <>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            label="Nombre"
                            variant="outlined"
                            value={editData.nombre}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                nombre: e.target.value,
                              })
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
                              setEditData({
                                ...editData,
                                apellido: e.target.value,
                              })
                            }
                          />
                        </Grid>
                      </>
                    )}
                </Grid>
              </Paper>
            </Grid>

            {/* Información para Encargados */}
            {(viewingUserType || user?.user_type?.toLowerCase()) ===
              "encargado" && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
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
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
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

            {/* Información para Estudiantes */}
            {(viewingUserType || user?.user_type?.toLowerCase()) ===
              "estudiante" && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
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
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
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

            {/* Información para Profesores (Tesis) */}
            {(viewingUserType || user?.user_type?.toLowerCase()) ===
              "profesor" && (
              <>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      flexDirection: { xs: "column", sm: "row" },
                      mb: 2,
                      gap: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1.25rem", sm: "1.5rem" },
                      }}
                    >
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
                      sx={{ width: { xs: "100%", sm: "auto" } }}
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
                      p: { xs: 2, sm: 3 },
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
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      }}
                    >
                      <AssignmentIcon color="primary" />
                      Tesis como Tutor ({tesisAsTutor.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {isXs ? (
                      tesisAsTutor.length > 0 ? (
                        tesisAsTutor.map((tesis) => {
                          const tesisKey = tesis.id_tesis || tesis.id;
                          const authors =
                            tesis.autores && Array.isArray(tesis.autores)
                              ? tesis.autores.slice(0, 2)
                              : [];

                          return (
                            <Paper key={tesisKey} sx={{ p: 2, mb: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 2,
                                }}
                              >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Tooltip
                                    title={
                                      tesis.nombre ||
                                      tesis.titulo ||
                                      "Sin título"
                                    }
                                    open={openTitleTooltip === tesisKey}
                                    arrow
                                  >
                                    <Box
                                      data-tooltip-id={tesisKey}
                                      onClick={() => showTitleTooltip(tesisKey)}
                                      sx={{ cursor: "pointer" }}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          fontWeight: "bold",
                                          mb: 0.5,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {tesis.nombre ||
                                          tesis.titulo ||
                                          "Sin título"}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    {authors.length > 0
                                      ? authors.map((a, idx) =>
                                          a.ci ? (
                                            <React.Fragment key={idx}>
                                              <Typography
                                                component="button"
                                                variant="caption"
                                                onClick={() =>
                                                  navigateToProfile(
                                                    a.ci,
                                                    "estudiante",
                                                  )
                                                }
                                                sx={{
                                                  textDecoration: "none",
                                                  cursor: "pointer",
                                                  color: "text.secondary",
                                                  background: "none",
                                                  border: "none",
                                                  p: 0,
                                                  m: 0,
                                                  display: "inline",
                                                  "&:hover": {
                                                    textDecoration: "underline",
                                                    color: "text.secondary",
                                                  },
                                                  "&:focus": {
                                                    outline: "none",
                                                  },
                                                }}
                                              >
                                                {a.nombre && a.apellido
                                                  ? `${a.nombre} ${a.apellido}`
                                                  : a.nombre ||
                                                    a.nombre_completo ||
                                                    ""}
                                              </Typography>
                                              {idx < authors.length - 1 && ", "}
                                            </React.Fragment>
                                          ) : (
                                            <span key={idx}>
                                              {a.nombre && a.apellido
                                                ? `${a.nombre} ${a.apellido}`
                                                : a.nombre ||
                                                  a.nombre_completo ||
                                                  ""}
                                              {idx < authors.length - 1 && ", "}
                                            </span>
                                          ),
                                        )
                                      : "N/A"}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: 0.5,
                                    ml: 1,
                                  }}
                                >
                                  <Chip
                                    label={
                                      tesis.estado
                                        ? tesis.estado.charAt(0).toUpperCase() +
                                          tesis.estado.slice(1).toLowerCase()
                                        : "N/A"
                                    }
                                    size="small"
                                    color={
                                      tesis.estado?.toLowerCase() ===
                                        "aprobado" ||
                                      tesis.estado?.toLowerCase() === "aprobada"
                                        ? "success"
                                        : tesis.estado?.toLowerCase() ===
                                            "rechazado" ||
                                          tesis.estado?.toLowerCase() ===
                                            "rechazada"
                                        ? "error"
                                        : "default"
                                    }
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {tesis.fecha
                                      ? dayjs(tesis.fecha).format("DD/MM/YYYY")
                                      : "N/A"}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })
                      ) : (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          No hay tesis registradas como tutor
                        </Box>
                      )
                    ) : (
                      <TableContainer
                        sx={{
                          maxHeight: { xs: 220, md: 300 },
                          minHeight: { xs: 120, md: 140 },
                        }}
                      >
                        <Table
                          size={isXs ? "small" : "medium"}
                          sx={{ tableLayout: "fixed" }}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sx={{ width: { xs: "auto", md: "40%" } }}
                              >
                                <strong>Título</strong>
                              </TableCell>
                              <TableCell
                                sx={{ width: { xs: "auto", md: "15%" } }}
                              >
                                <strong>Estado</strong>
                              </TableCell>
                              <TableCell
                                sx={{ width: { xs: "auto", md: "15%" } }}
                              >
                                <strong>Fecha</strong>
                              </TableCell>
                              <TableCell
                                sx={{ width: { xs: "auto", md: "30%" } }}
                              >
                                <strong>Autores</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {loadingTesis ? (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  sx={{ textAlign: "center", py: 4 }}
                                >
                                  <CircularProgress />
                                </TableCell>
                              </TableRow>
                            ) : tesisAsTutor.length > 0 ? (
                              tesisAsTutor.map((tesis) => (
                                <TableRow
                                  key={tesis.id_tesis || tesis.id}
                                  hover
                                >
                                  <TableCell
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <Tooltip
                                      title={
                                        tesis.nombre ||
                                        tesis.titulo ||
                                        "Sin título"
                                      }
                                      open={
                                        openTitleTooltip ===
                                        (tesis.id_tesis || tesis.id)
                                      }
                                      arrow
                                      placement="top"
                                      PopperProps={{
                                        modifiers: [
                                          {
                                            name: "offset",
                                            options: { offset: [0, 8] },
                                          },
                                        ],
                                      }}
                                    >
                                      <Box
                                        data-tooltip-id={
                                          tesis.id_tesis || tesis.id
                                        }
                                        onClick={() =>
                                          showTitleTooltip(
                                            tesis.id_tesis || tesis.id,
                                          )
                                        }
                                        sx={{
                                          cursor: "pointer",
                                          display: "inline",
                                          minWidth: 0,
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {tesis.nombre ||
                                            tesis.titulo ||
                                            "Sin título"}
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={
                                        tesis.estado
                                          ? tesis.estado
                                              .charAt(0)
                                              .toUpperCase() +
                                            tesis.estado.slice(1).toLowerCase()
                                          : "N/A"
                                      }
                                      size="small"
                                      color={
                                        tesis.estado?.toLowerCase() ===
                                          "aprobado" ||
                                        tesis.estado?.toLowerCase() ===
                                          "aprobada"
                                          ? "success"
                                          : tesis.estado?.toLowerCase() ===
                                              "rechazado" ||
                                            tesis.estado?.toLowerCase() ===
                                              "rechazada"
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
                                    {tesis.autores &&
                                    Array.isArray(tesis.autores) &&
                                    tesis.autores.length > 0 ? (
                                      <>
                                        {tesis.autores.map((a, idx) => (
                                          <React.Fragment key={idx}>
                                            {a.ci ? (
                                              <Link
                                                component="button"
                                                variant="body2"
                                                onClick={() =>
                                                  navigateToProfile(
                                                    a.ci,
                                                    "estudiante",
                                                  )
                                                }
                                                sx={{
                                                  cursor: "pointer",
                                                  textDecoration: "none",
                                                  color: "#1976d2",
                                                  fontWeight: 500,
                                                  "&:hover": {
                                                    backgroundColor:
                                                      "rgba(0,0,0,0.05)",
                                                    textDecoration: "underline",
                                                    opacity: 1,
                                                  },
                                                }}
                                              >
                                                {a.nombre && a.apellido
                                                  ? `${a.nombre} ${a.apellido}`
                                                  : a.nombre ||
                                                    a.nombre_completo ||
                                                    "N/A"}
                                              </Link>
                                            ) : (
                                              <span>
                                                {a.nombre && a.apellido
                                                  ? `${a.nombre} ${a.apellido}`
                                                  : a.nombre ||
                                                    a.nombre_completo ||
                                                    "N/A"}
                                              </span>
                                            )}
                                            {idx < tesis.autores.length - 1 &&
                                              ", "}
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
                                <TableCell
                                  colSpan={4}
                                  sx={{
                                    textAlign: "center",
                                    py: 6,
                                    color: "text.secondary",
                                  }}
                                >
                                  No hay tesis registradas como tutor
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                </Grid>

                {/* Tesis como Jurado */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3 },
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
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      }}
                    >
                      <GavelIcon color="primary" />
                      Tesis como Jurado ({tesisAsJurado.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {isXs ? (
                      tesisAsJurado.length > 0 ? (
                        tesisAsJurado.map((tesis) => {
                          const tesisKey = tesis.id_tesis || tesis.id;
                          const authors =
                            tesis.autores && Array.isArray(tesis.autores)
                              ? tesis.autores.slice(0, 2)
                              : [];

                          return (
                            <Paper key={tesisKey} sx={{ p: 2, mb: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 2,
                                }}
                              >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Tooltip
                                    title={
                                      tesis.nombre ||
                                      tesis.titulo ||
                                      "Sin título"
                                    }
                                    open={openTitleTooltip === tesisKey}
                                    arrow
                                  >
                                    <Box
                                      data-tooltip-id={tesisKey}
                                      onClick={() => showTitleTooltip(tesisKey)}
                                      sx={{ cursor: "pointer" }}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          fontWeight: "bold",
                                          mb: 0.5,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {tesis.nombre ||
                                          tesis.titulo ||
                                          "Sin título"}
                                      </Typography>
                                    </Box>
                                  </Tooltip>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    {authors.length > 0
                                      ? authors.map((a, idx) =>
                                          a.ci ? (
                                            <React.Fragment key={idx}>
                                              <Typography
                                                component="button"
                                                variant="caption"
                                                onClick={() =>
                                                  navigateToProfile(
                                                    a.ci,
                                                    "estudiante",
                                                  )
                                                }
                                                sx={{
                                                  textDecoration: "none",
                                                  cursor: "pointer",
                                                  color: "text.secondary",
                                                  background: "none",
                                                  border: "none",
                                                  p: 0,
                                                  m: 0,
                                                  display: "inline",
                                                  "&:hover": {
                                                    textDecoration: "underline",
                                                    color: "text.secondary",
                                                  },
                                                  "&:focus": {
                                                    outline: "none",
                                                  },
                                                }}
                                              >
                                                {a.nombre && a.apellido
                                                  ? `${a.nombre} ${a.apellido}`
                                                  : a.nombre ||
                                                    a.nombre_completo ||
                                                    ""}
                                              </Typography>
                                              {idx < authors.length - 1 && ", "}
                                            </React.Fragment>
                                          ) : (
                                            <span key={idx}>
                                              {a.nombre && a.apellido
                                                ? `${a.nombre} ${a.apellido}`
                                                : a.nombre ||
                                                  a.nombre_completo ||
                                                  ""}
                                              {idx < authors.length - 1 && ", "}
                                            </span>
                                          ),
                                        )
                                      : "N/A"}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: 0.5,
                                    ml: 1,
                                  }}
                                >
                                  <Chip
                                    label={
                                      tesis.estado
                                        ? tesis.estado.charAt(0).toUpperCase() +
                                          tesis.estado.slice(1).toLowerCase()
                                        : "N/A"
                                    }
                                    size="small"
                                    color={
                                      tesis.estado?.toLowerCase() ===
                                        "aprobado" ||
                                      tesis.estado?.toLowerCase() === "aprobada"
                                        ? "success"
                                        : tesis.estado?.toLowerCase() ===
                                            "rechazado" ||
                                          tesis.estado?.toLowerCase() ===
                                            "rechazada"
                                        ? "error"
                                        : "default"
                                    }
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {tesis.fecha
                                      ? dayjs(tesis.fecha).format("DD/MM/YYYY")
                                      : "N/A"}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })
                      ) : (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          No hay tesis registradas como jurado
                        </Box>
                      )
                    ) : (
                      <TableContainer
                        sx={{
                          maxHeight: { xs: 220, md: 300 },
                          minHeight: { xs: 120, md: 140 },
                        }}
                      >
                        <Table
                          size={isXs ? "small" : "medium"}
                          sx={{ tableLayout: "fixed" }}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sx={{ width: { xs: "auto", md: "40%" } }}
                              >
                                <strong>Título</strong>
                              </TableCell>
                              <TableCell
                                sx={{ width: { xs: "auto", md: "15%" } }}
                              >
                                <strong>Estado</strong>
                              </TableCell>
                              <TableCell
                                sx={{ width: { xs: "auto", md: "15%" } }}
                              >
                                <strong>Fecha</strong>
                              </TableCell>
                              <TableCell
                                sx={{ width: { xs: "auto", md: "30%" } }}
                              >
                                <strong>Autores</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {loadingTesis ? (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  sx={{ textAlign: "center", py: 4 }}
                                >
                                  <CircularProgress />
                                </TableCell>
                              </TableRow>
                            ) : tesisAsJurado.length > 0 ? (
                              tesisAsJurado.map((tesis) => (
                                <TableRow
                                  key={tesis.id_tesis || tesis.id}
                                  hover
                                >
                                  <TableCell
                                    sx={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <Tooltip
                                      title={
                                        tesis.nombre ||
                                        tesis.titulo ||
                                        "Sin título"
                                      }
                                      open={
                                        openTitleTooltip ===
                                        (tesis.id_tesis || tesis.id)
                                      }
                                      arrow
                                      placement="top"
                                      PopperProps={{
                                        modifiers: [
                                          {
                                            name: "offset",
                                            options: { offset: [0, 8] },
                                          },
                                        ],
                                      }}
                                    >
                                      <Box
                                        data-tooltip-id={
                                          tesis.id_tesis || tesis.id
                                        }
                                        onClick={() =>
                                          showTitleTooltip(
                                            tesis.id_tesis || tesis.id,
                                          )
                                        }
                                        sx={{
                                          cursor: "pointer",
                                          display: "inline",
                                          minWidth: 0,
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {tesis.nombre ||
                                            tesis.titulo ||
                                            "Sin título"}
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={
                                        tesis.estado
                                          ? tesis.estado
                                              .charAt(0)
                                              .toUpperCase() +
                                            tesis.estado.slice(1).toLowerCase()
                                          : "N/A"
                                      }
                                      size="small"
                                      color={
                                        tesis.estado?.toLowerCase() ===
                                          "aprobado" ||
                                        tesis.estado?.toLowerCase() ===
                                          "aprobada"
                                          ? "success"
                                          : tesis.estado?.toLowerCase() ===
                                              "rechazado" ||
                                            tesis.estado?.toLowerCase() ===
                                              "rechazada"
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
                                    {tesis.autores &&
                                    Array.isArray(tesis.autores) &&
                                    tesis.autores.length > 0 ? (
                                      <>
                                        {tesis.autores.map((a, idx) => (
                                          <React.Fragment key={idx}>
                                            {a.ci ? (
                                              <Link
                                                component="button"
                                                variant="body2"
                                                onClick={() =>
                                                  navigateToProfile(
                                                    a.ci,
                                                    "estudiante",
                                                  )
                                                }
                                                sx={{
                                                  cursor: "pointer",
                                                  textDecoration: "none",
                                                  color: "#1976d2",
                                                  fontWeight: 500,
                                                  "&:hover": {
                                                    backgroundColor:
                                                      "rgba(0,0,0,0.05)",
                                                    textDecoration: "underline",
                                                    opacity: 1,
                                                  },
                                                }}
                                              >
                                                {a.nombre && a.apellido
                                                  ? `${a.nombre} ${a.apellido}`
                                                  : a.nombre ||
                                                    a.nombre_completo ||
                                                    "N/A"}
                                              </Link>
                                            ) : (
                                              <span>
                                                {a.nombre && a.apellido
                                                  ? `${a.nombre} ${a.apellido}`
                                                  : a.nombre ||
                                                    a.nombre_completo ||
                                                    "N/A"}
                                              </span>
                                            )}
                                            {idx < tesis.autores.length - 1 &&
                                              ", "}
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
                                <TableCell
                                  colSpan={4}
                                  sx={{
                                    textAlign: "center",
                                    py: 6,
                                    color: "text.secondary",
                                  }}
                                >
                                  No hay tesis registradas como jurado
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
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
