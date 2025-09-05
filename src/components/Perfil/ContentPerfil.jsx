import { React } from "react";
import Avatar from "@mui/material/Avatar";
import { deepOrange } from "@mui/material/colors";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
const ContentPerfil = ({ isAsideVisible, user }) => {
  const marginLeftClass = isAsideVisible ? "ml-16" : "ml-0";

  return (
    <div
      className={`flex-grow w-full p-6 transition-margin-left duration-300 ease-in-out ${marginLeftClass}`}
    >
      {/* Header Section */}
      <div className="mb-8">
        <Typography variant="h4" component="h1" className="text-white font-bold mb-2">
          Mi Perfil
        </Typography>
        <Typography variant="body1" className="text-gray-400">
          Gestiona tu información personal y preferencias
        </Typography>
      </div>

      {/* Profile Card */}
      <Card 
        sx={{ 
          bgcolor: 'rgba(55, 65, 81, 0.8)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <CardContent className="p-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <Avatar
              sx={{
                bgcolor: deepOrange[500],
                width: 120,
                height: 120,
                fontSize: '2.5rem',
                border: '4px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
              alt="Usuario"
              src="/broken-image.jpg"
            >
              {user?.nombre?.charAt(0) || "U"}
            </Avatar>
            
            <div className="flex-1">
              <Typography variant="h4" component="h2" className="text-white font-bold mb-2">
                {user?.nombre || "Nombre no disponible"}
              </Typography>
              
              <div className="flex items-center gap-2 mb-4">
                <WorkIcon className="text-gray-400" />
                <Chip 
                  label={user?.cargo || "Cargo no disponible"} 
                  sx={{ 
                    bgcolor: 'rgba(59, 130, 246, 0.2)', 
                    color: '#60A5FA',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }} 
                />
              </div>
              
              <Typography variant="body1" className="text-gray-300">
                Miembro desde enero 2024
              </Typography>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Typography variant="h6" className="text-white font-semibold mb-4">
                Información de Contacto
              </Typography>
              
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <EmailIcon className="text-blue-400" />
                <div>
                  <Typography variant="body2" className="text-gray-400 text-sm">
                    Correo Electrónico
                  </Typography>
                  <Typography variant="body1" className="text-white">
                    {user?.email || "Correo no disponible"}
                  </Typography>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <PhoneIcon className="text-green-400" />
                <div>
                  <Typography variant="body2" className="text-gray-400 text-sm">
                    Teléfono
                  </Typography>
                  <Typography variant="body1" className="text-white">
                    {user?.telefono || "Teléfono no disponible"}
                  </Typography>
                </div>
              </div>
              
              {/* <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <LocationOnIcon className="text-red-400" />
                <div>
                  <Typography variant="body2" className="text-gray-400 text-sm">
                    Dirección
                  </Typography>
                  <Typography variant="body1" className="text-white">
                    {user?.direccion || "Dirección no disponible"}
                  </Typography>
                </div>
              </div> */}
            </div>

            {/* Additional Info Section */}
            <div className="space-y-4">
              <Typography variant="h6" className="text-white font-semibold mb-4">
                Información Adicional
              </Typography>
              
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                <Typography variant="body2" className="text-blue-300 text-sm mb-2">
                  Estado de la Cuenta
                </Typography>
                <Chip 
                  label="Activa" 
                  color="success" 
                  size="small"
                  sx={{ bgcolor: 'rgba(34, 197, 94, 0.2)', color: '#4ADE80' }}
                />
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg border border-green-500/30">
                <Typography variant="body2" className="text-green-300 text-sm mb-2">
                  Última Actividad
                </Typography>
                <Typography variant="body1" className="text-white">
                  Hace 2 horas
                </Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentPerfil;
