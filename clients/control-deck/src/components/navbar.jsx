import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  ManageAccounts as ManageAccountIcon,
  AccountCircle as AccountCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Button,
  ListItemIcon,
  Divider
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useTheme } from "ui/hooks";

import controlDeckImage from "../assets/maintenance.png";

const pages = {
  Home: "/",
  Admin: "/admin",
  Logs: "/logs"
};
const settings = {
  Profile: { icon: <AccountCircleIcon fontSize="small" />, path: "/profile" },
  Account: { icon: <ManageAccountIcon fontSize="small" />, path: "/account" }
};

export const NavigationBar = () => {
  const { user } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const currentPath = window.location.pathname;

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" color={mode === "light" ? "transparent" : "secondary"}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link to={"/"} className="hidden md:block">
            <Box
              component="img"
              src={controlDeckImage}
              sx={{ width: "2rem", cursor: "pointer", marginRight: "1rem" }}
            />
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {Object.entries(pages).map(([page, path]) => (
                <Link to={path} key={page} onClick={handleCloseNavMenu}>
                  <MenuItem
                    sx={{
                      textTransform: "capitalize",
                      backgroundColor: (theme) =>
                        currentPath === path
                          ? mode === "dark"
                            ? theme.palette.action.hover
                            : theme.palette.primary.main
                          : "",
                      color: (theme) =>
                        currentPath === path
                          ? mode === "dark"
                            ? theme.palette.primary.main
                            : "white"
                          : "inherit"
                    }}
                  >
                    <Typography sx={{ textAlign: "center" }}>{page}</Typography>
                  </MenuItem>
                </Link>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: "0.5rem" }}>
            {Object.entries(pages).map(([page, path]) => (
              <Link key={page} to={path} onClick={handleCloseNavMenu}>
                <Button
                  sx={{
                    textTransform: "capitalize",
                    backgroundColor: (theme) =>
                      currentPath === path
                        ? mode === "dark"
                          ? theme.palette.action.hover
                          : theme.palette.primary.main
                        : "",
                    color: (theme) =>
                      currentPath === path
                        ? mode === "dark"
                          ? theme.palette.primary.main
                          : "white"
                        : "inherit"
                  }}
                >
                  {page}
                </Button>
              </Link>
            ))}
          </Box>

          {/* Profile and theme Icon */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Toggle Theme">
              <IconButton
                onClick={toggleTheme}
                sx={{ backgroundColor: (theme) => theme.palette.action.hover, marginRight: 2 }}
              >
                {mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, scale: 0.92 }}>
                <Avatar alt={user?.name || "User Profile"} src={user?.picture} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {Object.entries(settings).map(([setting, options]) => (
                <Link key={setting} onClick={handleCloseUserMenu} to={options.path}>
                  <MenuItem>
                    <ListItemIcon>{options.icon}</ListItemIcon>
                    <Typography sx={{ textAlign: "center" }}>{setting}</Typography>
                  </MenuItem>
                </Link>
              ))}
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleCloseUserMenu}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography sx={{ textAlign: "center" }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
