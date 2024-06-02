import html2canvas from "html2canvas";
import React, { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header/Header";

// Classic Frames
import classicFrame1 from "../assets/ClassicFrames/classicFrame1.png";
import classicFrame2 from "../assets/ClassicFrames/classicFrame2.png";
import classicFrame3 from "../assets/ClassicFrames/classicFrame3.png";
import classicFrame4 from "../assets/ClassicFrames/classicFrame4.png";
import classicFrame5 from "../assets/ClassicFrames/classicFrame5.png";
import classicFrame6 from "../assets/ClassicFrames/classicFrame6.png";
import classicFrame7 from "../assets/ClassicFrames/classicFrame7.png";
import classicFrame8 from "../assets/ClassicFrames/classicFrame8.png";

// Gradient Frames
import GradientFrame1 from "../assets/GradientFrames/Gradient1.png";
import GradientFrame2 from "../assets/GradientFrames/Gradient2.png";
import GradientFrame3 from "../assets/GradientFrames/Gradient3.png";
import GradientFrame4 from "../assets/GradientFrames/Gradient4.png";
import GradientFrame5 from "../assets/GradientFrames/Gradient5.png";
import GradientFrame6 from "../assets/GradientFrames/Gradient6.png";

const SelectFrame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const imagePreview = location.state?.photoLink;
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [isClassicDropdownOpen, setIsClassicDropdownOpen] = useState(false);
  const [isGradientDropdownOpen, setIsGradientDropdownOpen] = useState(false);
  const combinedImageRef = useRef(null);

  console.log(imagePreview);

  const classicFrames = [
    { id: 1, src: classicFrame1 },
    { id: 2, src: classicFrame2 },
    { id: 3, src: classicFrame3 },
    { id: 4, src: classicFrame4 },
    { id: 5, src: classicFrame5 },
    { id: 6, src: classicFrame6 },
    { id: 7, src: classicFrame7 },
    { id: 8, src: classicFrame8 },
  ];

  const gradientFrames = [
    { id: 1, src: GradientFrame1 },
    { id: 2, src: GradientFrame2 },
    { id: 3, src: GradientFrame3 },
    { id: 4, src: GradientFrame4 },
    { id: 5, src: GradientFrame5 },
    { id: 6, src: GradientFrame6 },
  ];

  const toggleClassicDropdown = () => {
    setIsClassicDropdownOpen(!isClassicDropdownOpen);
    setIsGradientDropdownOpen(false);
  };

  const toggleGradientDropdown = () => {
    toast.error("Sorry These frames are not available right now..");

    /*  setIsGradientDropdownOpen(!isGradientDropdownOpen);
        setIsClassicDropdownOpen(false); */
  };

  const handleHome = async () => {
    navigate("/login");
  };

  const handleFrameSelect = (frame) => {
    setSelectedFrame(frame);
    setIsClassicDropdownOpen(false);
    setIsGradientDropdownOpen(false);
  };

  const handleDownload = () => {
    if (selectedFrame) {
      // Download the combined image with the selected frame
      if (combinedImageRef.current) {
        html2canvas(combinedImageRef.current).then((canvas) => {
          const dataURL = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = "framed-image.png";
          link.href = dataURL;
          link.click();
        });
      }
    } else {
      // Download the original image directly from Firebase
      fetch(imagePreview)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = "user-image.png";
          link.href = url;
          link.click();
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => console.error("Error downloading image:", error));
    }
  };
  const handlePrint = async () => {
    toast.error("We will have your photo ready, once we get printer :D");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-200">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Select Frame</h1>
      <div className="flex">
        <Toaster toastOptions={{ duration: 4000 }} />
        <div className="mr-4 w-64">
          {/* Classic Frames Dropdown */}
          <div className="relative">
            <div
              className="bg-gray-300 p-2 rounded cursor-pointer"
              onClick={toggleClassicDropdown}
            >
              <span>Classic Frames</span>
              <i
                className={`ml-2 fas fa-chevron-${
                  isClassicDropdownOpen ? "up" : "down"
                }`}
              ></i>
            </div>
            {isClassicDropdownOpen && (
              <div className="absolute z-10 bg-white rounded shadow-md p-2 max-h-60 w-full overflow-auto scrollbar-hide">
                {classicFrames.map((frame) => (
                  <div
                    key={frame.id}
                    className="flex items-center mb-2 cursor-pointer"
                    onClick={() => handleFrameSelect(frame)}
                  >
                    <img
                      src={frame.src}
                      alt={`Classic Frame ${frame.id}`}
                      className="w-12 h-12 mr-2"
                    />
                    <span>Classic Frame {frame.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gradient Frames Dropdown */}
          <div className="relative mt-4">
            <div
              className="bg-gray-300 p-2 rounded cursor-pointer"
              onClick={toggleGradientDropdown}
            >
              <span>Gradient Frames</span>
              <i
                className={`ml-2 fas fa-chevron-${
                  isGradientDropdownOpen ? "up" : "down"
                }`}
              ></i>
            </div>
            {isGradientDropdownOpen && (
              <div className="absolute z-10 bg-white rounded shadow-md p-2 max-h-60 w-full overflow-auto scrollbar-hide">
                {gradientFrames.map((frame) => (
                  <div
                    key={frame.id}
                    className="flex items-center mb-2 cursor-pointer"
                    onClick={() => handleFrameSelect(frame)}
                  >
                    <img
                      src={frame.src}
                      alt={`Gradient Frame ${frame.id}`}
                      className="w-12 h-12 mr-2"
                    />
                    <span>Gradient Frame {frame.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div ref={combinedImageRef} className="relative">
          {imagePreview && (
            <div>
              <img
                src={imagePreview}
                alt="Uploaded"
                className="max-w-full max-h-96"
              />
              {selectedFrame && (
                <img
                  src={selectedFrame.src}
                  alt="Selected Frame"
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${selectedFrame.src})`,
                    backgroundSize: "cover",
                    mixBlendMode: "multiply", // or 'overlay'
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mr-3"
          onClick={handleHome}
          /* disabled={!selectedFrame} */
        >
          Home
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mr-3"
          onClick={handleDownload}
          /*  disabled={!selectedFrame} */
        >
          Download
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
          onClick={handlePrint}
          /*   disabled={!selectedFrame} */
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default SelectFrame;
