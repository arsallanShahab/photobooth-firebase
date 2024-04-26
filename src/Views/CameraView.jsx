import React, { useState } from "react";
import Header from "./Header/Header";
import { useNavigate } from "react-router-dom";
import ExampleImage from '../assets/testImage.jpg'

const CameraView = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [useExampleImage, setUseExampleImage] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setUseExampleImage(false);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUseExampleImage = () => {
    setImagePreview(ExampleImage);
    setUseExampleImage(true);
  };

  const handleSelectFrame = () => {
    if (imagePreview) {
      navigate("/SelectFrame", { state: { imagePreview } });
    } else {
      // Handle case when no image is uploaded
    }
  };

  return (
    <div className="flex flex-col bg-gray-200 min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-96 h-96 bg-gray-300 rounded-lg flex items-center justify-center mb-4 relative">
          {imagePreview ? (
            <img src={imagePreview} alt="Uploaded" className="max-w-full max-h-full" />
          ) : (
            <span className="text-gray-500 text-2xl">Your Photo Here!</span>
          )}
          {imagePreview ? (
            <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Snap Again?!
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          ) : (
            <div className="absolute bottom-2 right-2 flex">
              <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer mr-2">
                Snap!
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleUseExampleImage}
              >
                Use Example
              </button>
            </div>
          )}
        </div>
        {imagePreview ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSelectFrame}
          >
            Select Your Frame!
          </button>
        ) : (
          null
        )}
      </main>
    </div>
  );
};

export default CameraView;