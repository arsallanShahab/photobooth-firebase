import React, { useEffect, useState } from "react";
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
import FlexContainer from "../component/FlexContainer";

const ClassicFrames = [
  { id: 7, src: classicFrame7 },
  { id: 8, src: classicFrame8 },
  { id: 1, src: classicFrame1 },
  { id: 2, src: classicFrame2 },
  { id: 3, src: classicFrame3 },
  { id: 4, src: classicFrame4 },
  { id: 5, src: classicFrame5 },
  { id: 6, src: classicFrame6 },
];

const AddFrame = () => {
  const [imageData, setImageData] = useState(null);
  const [activeFrame, setActiveFrame] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddFrame = (frameSrc) => {
    const frame = new Image();
    frame.src = frameSrc;
    frame.onload = async () => {
      const boundingBox = await findBoundingBox(frameSrc);
      const mergedImage = await mergeImages(
        frameSrc,
        imageData,
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );
      setActiveFrame(mergedImage);
    };
  };

  async function findBoundingBox(imageUrl) {
    const image = await loadImage(imageUrl);

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get canvas context");
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }

  async function mergeImages(frameSrc, imageSrc, x, y, width, height) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Load the frame and the image
    const [frame, image] = await Promise.all([
      loadImage(frameSrc),
      loadImage(imageSrc),
    ]);

    // Set the canvas size to the frame size
    canvas.width = frame.width;
    canvas.height = frame.height;

    // Calculate the scale factor
    const scaleFactor = Math.max(width / image.width, height / image.height);

    // Calculate the position
    const posX = x + (width - image.width * scaleFactor) / 2;
    const posY = y + (height - image.height * scaleFactor) / 2;

    // Draw the image and the frame
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      posX,
      posY,
      image.width * scaleFactor,
      image.height * scaleFactor
    );
    ctx.drawImage(frame, 0, 0, frame.width, frame.height);

    const dataUrl = canvas.toDataURL("image/jpeg");
    const blob = await (await fetch(dataUrl)).blob();
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    return canvas.toDataURL();
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  useEffect(() => {
    const state = location.state;
    if (!state?.imageData) {
      navigate("/");
      return;
    }
    const image = new Image();
    image.src = location.state?.imageData;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      setImageData(canvas.toDataURL("image/jpeg"));
      setActiveFrame(canvas.toDataURL("image/jpeg"));
    };
  }, [location]);
  return (
    <div className="flex bg-gray-200 flex-col min-h-screen items-start justify-start *:w-full">
      <Header />
      <main className="flex flex-row items-center justify-center w-full *:basis-1/2 gap-5 p-5">
        <div>
          <h1>Frame Selection</h1>
          <p>Select a frame from the below options</p>
          <FlexContainer variant="row-start" wrap="wrap">
            {ClassicFrames.map((frame) => (
              <img
                key={frame.id}
                src={frame.src}
                alt={`Frame ${frame.id}`}
                className="w-20 h-20 cursor-pointer"
                onClick={() => handleAddFrame(frame.src)}
              />
            ))}
          </FlexContainer>
        </div>
        <div>
          <img src={activeFrame} alt="Captured" className="h-80 w-auto" />
          <a
            href={downloadUrl}
            download={"frame-image.jpeg"}
            className="mt-3 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download
          </a>
        </div>
      </main>
    </div>
  );
};

export default AddFrame;
