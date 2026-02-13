import React, { useState, useEffect, useCallback, forwardRef } from "react";
import userService from "@/services/user.service";
import { Box, Tabs, Tab } from "@mui/material";
import {
  Description as TesisIcon,
  Person as EstudianteIcon,
  School as ProfesorIcon,
  SupervisorAccount as EncargadoIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Importa los formularios separados
import TesisForm from "./tesisForm.jsx";
import PersonaForm from "./PersonaForm.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const VITE_API_URL = API_URL || "http://localhost:8080/api";

// Contenedor del Tab (Personalizado para mantener el estado de los componentes montados)
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
      {...other}
    >
      {/* Se eliminó la condición 'value === index &&' para conservar el estado al cambiar tabs */}
      <Box sx={{ pt: 3, pb: 3, px: 1 }}>{children}</Box>
    </div>
  );
}

/**
 * Componente ManagementForm
 * Contenedor principal de pestañas para la gestión de Tesis y Personas (Estudiantes, Profesores, Encargados).
 *
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback para operación exitosa.
 * @param {Function} props.onClose - Callback para cerrar el formulario.
 * @param {Object} props.tesisToEdit - Tesis a editar, si aplica.
 */
const ManagementForm = forwardRef((props, ref) => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  // isMobile será true en pantallas menores a 'md' (900px por defecto)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [dropdownOptions, setDropdownOptions] = useState({
    profesores: [],
    encargados: [],
    sedes: [],
    estudiantes: [],
  });

  // Estado para guardar datos de pre-llenado al crear usuarios desde el formulario de tesis
  const [prefillData, setPrefillData] = useState(null);

  // Forzar la pestaña de Tesis si estamos editando una tesis existente
  useEffect(() => {
    if (props.tesisToEdit) {
      setActiveTab(0);
    }
  }, [props.tesisToEdit]);

  /**
   * Carga las opciones disponibles para los selectores (personas, sedes).
   */
  const loadFormOptions = useCallback(async () => {
    try {
      const [profesoresRes, encargadosRes, sedesRes, estudiantesRes] =
        await Promise.all([
          userService.getProfesores(),
          userService.getEncargados(),
          userService.getSedes(),
          userService.getEstudiantes(),
        ]);

      setDropdownOptions({
        profesores: profesoresRes.data || [],
        encargados: encargadosRes.data || [],
        sedes: sedesRes.data || [],
        estudiantes: estudiantesRes.data || [],
      });
    } catch (error) {
      console.error("Error al cargar opciones:", error);
      setDropdownOptions({
        profesores: [],
        encargados: [],
        sedes: [],
        estudiantes: [],
      });
    }
  }, []);

  useEffect(() => {
    loadFormOptions();
  }, [loadFormOptions]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPrefillData(null); // Limpiar el pre-llenado si el usuario cambia de pestaña manualmente
  };

  /**
   * Maneja la solicitud desde TesisForm para crear un nuevo usuario rápidamente.
   * Cambia a la pestaña correspondiente y pre-llena el nombre.
   */
  const handleRequestCreateUser = useCallback((type, name) => {
    console.log("Solicitud para crear:", type, "con nombre:", name);
    setPrefillData({ type, name });

    if (type === "estudiante") {
      setActiveTab(1);
    } else if (type === "profesor") {
      setActiveTab(2);
    } else if (type === "encargado") {
      setActiveTab(3);
    }
  }, []);

  const handlePrefillConsumed = useCallback(() => {
    setPrefillData(null);
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        p: { xs: 1, sm: 3 },
        borderRadius: { xs: 1, sm: 2 },
        boxShadow: 24,
        maxWidth: { xs: "380px", sm: "600px", md: "700px", lg: "800px" },
        width: "100%",
        mx: "auto",
        maxHeight: { xs: "100vh", sm: "90vh" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Formularios de gestión"
          // En móvil scrollable, en escritorio centrado
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          centered={!isMobile}
          sx={{
            "& .MuiTab-root": {
              "&:hover": {
                backgroundColor: "transparent",
                color: "primary.main",
                "& .MuiSvgIcon-root": {
                  color: "primary.main",
                },
              },
            },
          }}
        >
          <Tab icon={<TesisIcon />} label="Tesis" id="form-tab-0" />
          <Tab icon={<EstudianteIcon />} label="Estudiante" id="form-tab-1" />
          <Tab icon={<ProfesorIcon />} label="Profesor" id="form-tab-2" />
          <Tab icon={<EncargadoIcon />} label="Encargado" id="form-tab-3" />
        </Tabs>
      </Box>

      {/* Panel de Tesis */}
      <TabPanel value={activeTab} index={0}>
        <TesisForm
          dropdownOptions={dropdownOptions}
          onSuccess={props.onSuccess}
          onClose={props.onClose}
          onRequestCreateUser={handleRequestCreateUser}
          tesisToEdit={props.tesisToEdit}
        />
      </TabPanel>

      {/* Panel de Estudiante */}
      <TabPanel value={activeTab} index={1}>
        <PersonaForm
          role="estudiante"
          onUserCreated={loadFormOptions}
          prefillData={prefillData}
          onPrefillConsumed={handlePrefillConsumed}
        />
      </TabPanel>

      {/* Panel de Profesor */}
      <TabPanel value={activeTab} index={2}>
        <PersonaForm
          role="profesor"
          onUserCreated={loadFormOptions}
          prefillData={prefillData}
          onPrefillConsumed={handlePrefillConsumed}
        />
      </TabPanel>

      {/* Panel de Encargado */}
      <TabPanel value={activeTab} index={3}>
        <PersonaForm
          role="encargado"
          onUserCreated={loadFormOptions}
          sedes={dropdownOptions.sedes}
          prefillData={prefillData}
          onPrefillConsumed={handlePrefillConsumed}
        />
      </TabPanel>
    </Box>
  );
});

export default ManagementForm;
