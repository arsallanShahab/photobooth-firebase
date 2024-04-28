import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Views/Home";
import PhotoUpload from "./Views/PhotoUpload";
import SelectFrame from "./Views/SelectFrame";
import QRCode from "./Views/QRCode";
import Login from "./Views/Login";
import Welcome from "./Views/Welcome";
import Redirect from "./Views/Redirect/redirect";

function App() {

  return (

    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/PhotoUpload" element={<PhotoUpload />} />
        <Route path="/QRCode" element={<QRCode />} />
        <Route path="/SelectFrame" element={<SelectFrame />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Redirect" element={<Redirect />} />
      </Routes>
    </Router>

  )
}

export default App;