import React from "react";
import Camera from "../component/Camera";
import Header from "./Header/Header";

const CameraView = () => {
  return (
    <div className="flex bg-gray-200 flex-col items-center justify-center min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center gap-5">
        <Camera />
      </main>
    </div>
  );
};

export default CameraView;
