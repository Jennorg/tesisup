import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Aside from "@/components/main/Layout/Aside";
import SearchBar from "@/components/main/Search/SearchBar";
import LogoContainer from "@/components/main/Ui/LogoContainer";

import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { deepOrange } from "@mui/material/colors";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

const Header = ({
  isAsideVisible,
  onToggleMenu,
  setIsLoading,
  tesisEncontradas,
  setTesisEncontradas,
  setHaBuscado,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    handleClose();
  };

  const handleProfileClick = () => {
    navigate("/registrar-estudiante");
    handleClose();
  };

  return (
    <div className="flex gap-3 justify-between items-center w-full">

      <LogoContainer />

      <SearchBar
        setIsLoading={setIsLoading}
        setTesisEncontradas={setTesisEncontradas}
        tesisEncontradas={tesisEncontradas}
        setHaBuscado={setHaBuscado}
      />

      <Avatar
        sx={{ 
          bgcolor: deepOrange[500],
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          }
        }}
        alt="Usuario"
        src="/broken-image.jpg"
        size="medium"
        onClick={handleAvatarClick}
        aria-controls={open ? 'avatar-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        U
      </Avatar>
      <Menu
        id="avatar-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Header;
