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
import Button from "@mui/material/Button";
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
            const [tesisResponse, profesoresRes, encargadosRes, estudiantesRes, sedesRes] =
              await Promise.all([
                axios.get(`${VITE_API_URL}/tesis`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }),
                axios.get(`${VITE_API_URL}/profesor`),
                axios.get(`${VITE_API_URL}/encargado`),
                axios.get(`${VITE_API_URL}/estudiantes`),
                axios.get(`${VITE_API_URL}/sede`),
              ]);

            const allTesis = tesisResponse.data || [];
            const profesores = profesoresRes.data.data || [];
            const encargados = encargadosRes.data.data || [];
            const estudiantes = estudiantesRes.data.data || [];
            const sedes = sedesRes.data.data || [];

            // Enriquecer datos de tesis con información relacionada
            const enrichedTesis = allTesis.map((tesis) => {
              const autor = estudiantes.find(
                (e) => String(e.ci) === String(tesis.id_estudiante)
              );
              const tutor = profesores.find(
                (p) => String(p.ci) === String(tesis.id_tutor)
              );
              const encargado = encargados.find(
                (e) => String(e.ci) === String(tesis.id_encargado)
              );
              const sede = sedes.find((s) => s.id === tesis.id_sede);

              return {
                ...tesis,
                autor,
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
            // Asumimos que puede haber un campo jurados (array) o id_jurado
            const juradoTesis = enrichedTesis.filter((t) => {
              // Verificar si hay un array de jurados
              if (t.jurados && Array.isArray(t.jurados)) {
                return t.jurados.some(
                  (jurado) => String(jurado.ci || jurado) === String(targetCi)
                );
              }
              // Verificar si hay un campo id_jurado único
              if (t.id_jurado) {
                return String(t.id_jurado) === String(targetCi);
              }
              // Verificar si hay múltiples campos id_jurado_1, id_jurado_2, etc.
              return (
                String(t.id_jurado_1) === String(targetCi) ||
                String(t.id_jurado_2) === String(targetCi) ||
                String(t.id_jurado_3) === String(targetCi)
              );
            });
            setTesisAsJurado(juradoTesis);
          } catch (tesisError) {
            console.error("Error al obtener tesis del profesor:", tesisError);
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

  const handleDownloadExcel = () => {
    const displayData = profileData || user;
    
    // Combinar todas las tesis con su rol
    const allTesisWithRole = [
      ...tesisAsTutor.map((t) => ({ ...t, rol: "Tutor" })),
      ...tesisAsJurado.map((t) => ({ ...t, rol: "Jurado" })),
    ];

    // Preparar datos para Excel
    const excelData = allTesisWithRole.map((tesis) => ({
      "ID Tesis": tesis.id_tesis || tesis.id || "",
      "Título": tesis.nombre || tesis.titulo || "",
      "Rol": tesis.rol || "",
      "Estado": tesis.estado || "",
      "Fecha": tesis.fecha
        ? dayjs(tesis.fecha).format("DD/MM/YYYY")
        : "",
      "Autor/Estudiante": tesis.autor
        ? tesis.autor.nombre_completo || `${tesis.autor.nombre} ${tesis.autor.apellido}` || tesis.autor.nombre
        : tesis.autores
        ? tesis.autores.map((a) => a.nombre || a.nombre_completo).join(", ")
        : "",
      "Encargado": tesis.encargado
        ? tesis.encargado.nombre_completo || `${tesis.encargado.nombre} ${tesis.encargado.apellido}` || tesis.encargado.nombre
        : "",
      "Sede": tesis.sede_nombre || tesis.sede || "",
    }));

    // Crear workbook y worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tesis");

    // Generar nombre del archivo
    const fileName = `Tesis_${displayData?.nombre || "Profesor"}_${dayjs().format("YYYY-MM-DD")}.xlsx`;

    // Descargar archivo
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
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PersonIcon color="primary" />
                  Información Personal
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BadgeIcon sx={{ color: "text.secondary" }} />
                      <Box>
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Correo Electrónico
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {displayData?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Teléfono
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {displayData?.telefono}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
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
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      Tesis en las que ha participado
                    </Typography>
                    <Button
                      variant="contained"
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
                    {tesisAsTutor.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <strong>Título</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Estado</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Fecha</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Autor</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tesisAsTutor.map((tesis) => (
                              <TableRow key={tesis.id_tesis || tesis.id}>
                                <TableCell>
                                  {tesis.nombre || tesis.titulo || "Sin título"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={tesis.estado || "N/A"}
                                    size="small"
                                    color={
                                      tesis.estado === "Aprobado"
                                        ? "success"
                                        : tesis.estado === "Rechazado"
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
                                <TableCell>
                                  {tesis.autor && tesis.autor.ci ? (
                                    <Link
                                      component="button"
                                      variant="body2"
                                      onClick={() =>
                                        navigateToProfile(tesis.autor.ci, "estudiante")
                                      }
                                      sx={{
                                        cursor: "pointer",
                                        textDecoration: "none",
                                        "&:hover": {
                                          textDecoration: "underline",
                                        },
                                      }}
                                    >
                                      {tesis.autor.nombre_completo ||
                                        `${tesis.autor.nombre} ${tesis.autor.apellido}` ||
                                        tesis.autor.nombre}
                                    </Link>
                                  ) : tesis.autores ? (
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
                                              {a.nombre || a.nombre_completo}
                                            </Link>
                                          ) : (
                                            <span>{a.nombre || a.nombre_completo}</span>
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
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay tesis registradas como tutor
                      </Typography>
                    )}
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
                    {tesisAsJurado.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <strong>Título</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Estado</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Fecha</strong>
                              </TableCell>
                              <TableCell>
                                <strong>Autor</strong>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tesisAsJurado.map((tesis) => (
                              <TableRow key={tesis.id_tesis || tesis.id}>
                                <TableCell>
                                  {tesis.nombre || tesis.titulo || "Sin título"}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={tesis.estado || "N/A"}
                                    size="small"
                                    color={
                                      tesis.estado === "Aprobado"
                                        ? "success"
                                        : tesis.estado === "Rechazado"
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
                                <TableCell>
                                  {tesis.autor && tesis.autor.ci ? (
                                    <Link
                                      component="button"
                                      variant="body2"
                                      onClick={() =>
                                        navigateToProfile(tesis.autor.ci, "estudiante")
                                      }
                                      sx={{
                                        cursor: "pointer",
                                        textDecoration: "none",
                                        "&:hover": {
                                          textDecoration: "underline",
                                        },
                                      }}
                                    >
                                      {tesis.autor.nombre_completo ||
                                        `${tesis.autor.nombre} ${tesis.autor.apellido}` ||
                                        tesis.autor.nombre}
                                    </Link>
                                  ) : tesis.autores ? (
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
                                              {a.nombre || a.nombre_completo}
                                            </Link>
                                          ) : (
                                            <span>{a.nombre || a.nombre_completo}</span>
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
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hay tesis registradas como jurado
                      </Typography>
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

