import React, { useState, useEffect, useCallback, forwardRef } from "react";
import axios from "axios";
import {
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Description as TesisIcon,
  Person as EstudianteIcon,
  School as ProfesorIcon,
  SupervisorAccount as EncargadoIcon
} from "@mui/icons-material";

// Importa los formularios separados
import TesisForm from "./tesisForm.jsx";
import PersonaForm from "./PersonaForm.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const VITE_API_URL = API_URL || "http://localhost:8080/api";

// Contenedor del Tab (Modificado para NO desmontar los hijos)
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index} // <-- Esto ya oculta el panel
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
      {...other}
    >
      {/* Se eliminó la condición 'value === index &&' para conservar el estado */}
      <Box sx={{ pt: 3, pb: 3, px: 1 }}>
        {children}
      </Box>
    </div>
  );
}

const ManagementForm = forwardRef((props, ref) => {
  const [activeTab, setActiveTab] = useState(0); 
  
  const [dropdownOptions, setDropdownOptions] = useState({
    profesores: [],
    encargados: [],
    sedes: [],
    estudiantes: [],
  });
  
  // Estado para guardar la tesis a editar
  const [prefillData, setPrefillData] = useState(null);

  // Nuevo useEffect para forzar la pestaña de Tesis si estamos editando
  useEffect(() => {
    if (props.tesisToEdit) {
      setActiveTab(0); // Forzar la pestaña 0 (Tesis)
    }
  }, [props.tesisToEdit]);

  const loadFormOptions = useCallback(async () => {
    try {
      const [profesoresRes, encargadosRes, sedesRes, estudiantesRes] =
        await Promise.all([
          axios.get(`${VITE_API_URL}/profesor`),
          axios.get(`${VITE_API_URL}/encargado`),
          axios.get(`${VITE_API_URL}/sede`),
          axios.get(`${VITE_API_URL}/estudiantes`),
        ]);

      setDropdownOptions({
        profesores: profesoresRes.data.data || [],
        encargados: encargadosRes.data.data || [],
        sedes: sedesRes.data.data || [],
        estudiantes: estudiantesRes.data.data || [],
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

  // Función que maneja la solicitud de TesisForm para cambiar de pestaña
  const handleRequestCreateUser = (type, name) => {
    console.log("Solicitud para crear:", type, "con nombre:", name);
    setPrefillData({ type, name }); // Guarda el nombre y tipo
    
    // Cambia a la pestaña correspondiente
    if (type === 'estudiante') {
      setActiveTab(1);
    } else if (type === 'profesor') {
      setActiveTab(2);
    } else if (type === 'encargado') {
      setActiveTab(3);
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        p: 3,
        borderRadius: 2,
        boxShadow: 24,
        maxWidth: "600px",
        width: "95%",
        mx: "auto",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Formularios de gestión"
          variant="scrollable"
          scrollButtons="auto"
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
          tesisToEdit={props.tesisToEdit} // Pasar 'tesisToEdit' al TesisForm
        />
      </TabPanel>

      {/* Panel de Estudiante */}
      <TabPanel value={activeTab} index={1}>
        <PersonaForm
          role="estudiante"
          onUserCreated={loadFormOptions} 
          prefillData={prefillData} // Pasar los datos de pre-llenado
          onPrefillConsumed={() => setPrefillData(null)} // Función para limpiar
        />
      </TabPanel>

      {/* Panel de Profesor */}
      <TabPanel value={activeTab} index={2}>
        <PersonaForm
          role="profesor"
          onUserCreated={loadFormOptions} 
          prefillData={prefillData} 
          onPrefillConsumed={() => setPrefillData(null)}
        />
      </TabPanel>

      {/* Panel de Encargado */}
      <TabPanel value={activeTab} index={3}>
        <PersonaForm
          role="encargado"
          onUserCreated={loadFormOptions} 
          sedes={dropdownOptions.sedes} 
          prefillData={prefillData} 
          onPrefillConsumed={() => setPrefillData(null)}
        />
      </TabPanel>
    </Box>
  );
});

export default ManagementForm;