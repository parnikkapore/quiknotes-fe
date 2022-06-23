import React from "react";
import Canvas from "./Components/Canvas.js";
import PageLogin from "./Components/PageLogin";
import { useAuth } from "./hooks/useAuth";
import AppShell from "./Components/AppShell";
import "./App.css";

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <AppShell />
      {user ? <Canvas /> : <PageLogin />}
    </div>
  );
}

export default App;
