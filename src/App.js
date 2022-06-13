import React from 'react';
import Canvas from "./Components/Canvas.js";
import PageLogin from "./Components/PageLogin";
import { useAuth } from "./hooks/useAuth";
import { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, MenuItem, Menu } from "@mui/material";
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from "react-router-dom";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import HelpIcon from '@mui/icons-material/Help';
import { styled } from '@mui/material/styles';
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

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));

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
            <HtmlTooltip
              enterTouchDelay={0}
              leaveTouchDelay={5000}
              title={
                <React.Fragment>
                  <Typography color="inherit"><strong>Help Page</strong></Typography>
                  <b>{"To move around: "}</b>{"click on the canvas with hand tool and drag"}<br />
                  <b>{"To zoom in and out: "}</b>{"Press control and scroll"}<br />
                  <b>{"To scroll left and right: "}</b>{"Press shift and scroll"}<br />
                  <b>{"To undo: "}</b>{"Press control and z"}<br />
                  <b>{"To redo: "}</b>{"Press control and y or press control and shift and z"}<br /><br />
                  <a href="https://github.com/parnikkapore/quiknotes-fe"><strong>Our Github repo</strong></a>
                </React.Fragment>
              }
            >
              <IconButton
                size="medium"
                aria-label="Help"
                color="inherit"
              >
                <HelpIcon />
              </IconButton>
            </HtmlTooltip>
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