import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AddFrame from "./Views/AddFrame";
import CameraView from "./Views/CameraView";
import EditPhoto from "./Views/EditPhoto";
import Home from "./Views/Home";
import Login from "./Views/Login";
import PhotoUpload from "./Views/PhotoUpload";
import QRCode from "./Views/QRCode";
import Redirect from "./Views/Redirect/redirect";
import SelectFrame from "./Views/SelectFrame";
import Welcome from "./Views/Welcome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/PhotoUpload" element={<PhotoUpload />} />
        <Route path="/CameraView" element={<CameraView />} />
        <Route path="/EditPhoto" element={<EditPhoto />} />
        <Route path="/AddFrame" element={<AddFrame />} />
        <Route path="/QRCode" element={<QRCode />} />
        <Route path="/SelectFrame" element={<SelectFrame />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Redirect" element={<Redirect />} />
      </Routes>
    </Router>
  );
}

export default App;
