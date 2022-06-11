import Canvas from "./Components/Canvas.js";
import PageLogin from "./Components/PageLogin";
import { useAuth } from "./hooks/useAuth";
import { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, MenuItem, Menu } from "@mui/material";
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const { user } = useAuth();
  return <div className="App">
    <AppShell />
    {user ? <Canvas /> : <PageLogin />}
  </div>
}

export default App;

function AppShell() {
  const { user, signout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    handleClose();
    navigate("/Login");
  }
  const handleLogout = () => {
    handleClose();
    signout();
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate("/Profile");
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          style={{ flexGrow: 1, textAlign: "left" }}
        >
          Creative Noters
        </Typography>
        {user ?
          <div>
            <IconButton
              size="medium"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Log out</MenuItem>
            </Menu>
          </div> : <div>
            <IconButton
              size="medium"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogin}>Sign in</MenuItem>
            </Menu>
          </div>
        }
      </Toolbar>
    </AppBar>
  );
}