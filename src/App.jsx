import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Views/Home";
import CameraView from "./Views/CameraView";
import SelectFrame from "./Views/SelectFrame";

function App() {

  return (

    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cameraView" element={<CameraView />} />
        <Route path="/SelectFrame" element={<SelectFrame />} />
      </Routes>
    </Router>

  )
}

export default App;