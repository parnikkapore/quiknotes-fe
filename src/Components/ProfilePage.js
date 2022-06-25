import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Menu,
  Button,
  Container,
  Box,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";

function ProfilePage() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/");
  };

  return (
    <>
      <AppShell />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Profile
          </Typography>
          <OverviewBox />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleNavigate}
          >
            Back
          </Button>
        </Box>
      </Container>
    </>
  );
}

function OverviewBox(props) {
  // This is passed all the way down from App

  const { user } = useAuth();

  const [name, setName] = useState("Loading name...");

  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  return (
    <div>
      <p>
        Welcome back,{" "}
        <strong
          role="button"
          onClick={() => {
            const newName = prompt("What is your name?", name);
            setName(newName);
            window.localStorage.setItem("name", newName);
          }}
        >
          {name || "<set a name>"}
        </strong>
        !
      </p>
    </div>
  );
}

export default ProfilePage;

function AppShell() {
  const { user, signout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    handleClose();
    signout();
    navigate("/");
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate("/");
  };

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
        {user && (
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
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Canvas</MenuItem>
              <MenuItem onClick={handleLogout}>Log out</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}
