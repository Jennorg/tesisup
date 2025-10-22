import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import LogoutIcon from "@mui/icons-material/Logout";
import FilterListIcon from "@mui/icons-material/FilterList";
import IconButton from "@mui/material/IconButton";

const Header = ({
  isAsideVisible,
  onToggleMenu,
  setIsLoading,
  tesisEncontradas,
  setTesisEncontradas,
  setHaBuscado,
  onToggleFilter,
  isFilterVisible,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const avatarLetter = user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U";

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/");
    handleClose();
  };

  const handleProfileClick = () => {
    navigate("/perfil");
    handleClose();
  };

  return (
    <div className="flex gap-3 justify-between items-center w-full p-3">
      <LogoContainer />

      <SearchBar
        setIsLoading={setIsLoading}
        setTesisEncontradas={setTesisEncontradas}
        tesisEncontradas={tesisEncontradas}
        setHaBuscado={setHaBuscado}
      />
      <IconButton
        onClick={() => onToggleFilter(!isFilterVisible)}
        sx={{ color: "white" }}
        aria-label="toggle filters"
      >
        <FilterListIcon />
      </IconButton>

      <Avatar
        sx={{
          bgcolor: deepOrange[500],
          cursor: "pointer",
          "&:hover": {
            opacity: 0.8,
          },
        }}
        alt="Usuario"
        src="/broken-image.jpg"
        size="medium"
        onClick={handleAvatarClick}
        aria-controls={open ? "avatar-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        {avatarLetter}
      </Avatar>
      <Menu
        id="avatar-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {user?.nombre} {user?.apellido}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
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
