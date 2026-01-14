import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

import SearchBar from "@/components/main/Search/SearchBar";
import LogoContainer from "@/components/Ui/LogoContainer";

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
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Header = ({
  setIsLoading,
  setHaBuscado,
  onToggleFilter,
  isFilterVisible,
  setPaginationData,
  setSearchQuery,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const { mode, toggleColorMode } = useContext(ThemeContext);
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
    navigate("/profile");
    handleClose();
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 p-1">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center h-20 md:h-24">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <LogoContainer />
          </div>

          {/* Search Section */}
          <div className="flex justify-center w-full px-2 md:px-8">
            <div className="w-full max-w-2xl">
              <SearchBar
                setSearchQuery={setSearchQuery}
                setPaginationData={setPaginationData}
              />
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center justify-end gap-2 md:gap-4">
            <IconButton
              onClick={() => onToggleFilter(!isFilterVisible)}
              className="transition-transform hover:scale-105"
              sx={{ color: "text.primary" }}
              aria-label="toggle filters"
            >
              <FilterListIcon />
            </IconButton>

            <IconButton
              onClick={toggleColorMode}
              color="inherit"
              className="transition-transform hover:scale-105"
            >
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, height: 24, alignSelf: "center" }}
            />

            <Avatar
              sx={{
                bgcolor: deepOrange[500],
                cursor: "pointer",
                width: 40,
                height: 40,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  opacity: 0.9,
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
              alt="Usuario"
              src="/broken-image.jpg"
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
                  filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.1))",
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 220,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.02)",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {user?.nombre} {user?.apellido}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, fontSize: "0.875rem" }}
                >
                  {user?.email}
                </Typography>
                {user?.user_type && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary uppercase tracking-wide">
                    {user.user_type}
                  </span>
                )}
              </Box>
              <Divider />
              <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Ver Perfil</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.5, color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "error.main" }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cerrar Sesión</ListItemText>
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
