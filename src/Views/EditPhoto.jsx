import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useLocation, useNavigate } from "react-router-dom";
import FlexContainer from "../component/FlexContainer";
import setCanvasPreview from "../lib/setCanvasPreview";
import { convertImageToDataURL, loadImage } from "../lib/utils";
import Header from "./Header/Header";

const EditPhoto = () => {
  const location = useLocation();
  const [originalImage, setOriginalImage] = useState();
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [croppedImage, setCroppedImage] = useState();
  const [greyscale, setGreyscale] = useState(false);
  const [gradient, setGradient] = useState(false);
  const [imageWithoutFilter, setImageWithoutFilter] = useState();
  const photoLink = location.state?.photoLink;
  const capturedImage = location.state?.capturedImage;
  const previewCanvasRef = useRef(null);
  // console.log(capturedImage, photoLink, "capturedImage", "photoLink");

  const onCropComplete = (crop) => {
    console.log(crop, "crop");
    setCompletedCrop(crop);
  };

  const handleCancelCrop = () => {
    setCrop(null);
  };

  const navigate = useNavigate();

  // const handleCropImage = () => {
  //   const image = new Image();
  //   image.src = originalImage;
  //   image.onload = () => {
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");

  //     // Handle dynamic image scaling
  //     const containerWidth = image.offsetWidth;
  //     const containerHeight = image.offsetHeight;
  //     const imageAspectRatio = image.width / image.height;
  //     const containerAspectRatio = containerWidth / containerHeight;

  //     let newWidth, newHeight;
  //     if (imageAspectRatio > containerAspectRatio) {
  //       newWidth = containerWidth;
  //       newHeight = containerWidth / imageAspectRatio;
  //     } else {
  //       newHeight = containerHeight;
  //       newWidth = containerHeight * imageAspectRatio;
  //     }

  //     // Scale the image to fit the container while maintaining aspect ratio
  //     canvas.width = newWidth;
  //     canvas.height = newHeight;

  //     // Draw the scaled image onto the canvas
  //     ctx.drawImage(image, 0, 0, newWidth, newHeight);

  //     // Calculate the actual crop coordinates relative to the scaled image
  //     const scaledX = completedCrop.x * (newWidth / image.width);
  //     const scaledY = completedCrop.y * (newHeight / image.height);
  //     const scaledWidth = completedCrop.width * (newWidth / image.width);
  //     const scaledHeight = completedCrop.height * (newHeight / image.height);

  //     // Crop the scaled image and generate a new image object
  //     const croppedCanvas = document.createElement("canvas");
  //     croppedCanvas.width = scaledWidth;
  //     croppedCanvas.height = scaledHeight;
  //     const croppedCtx = croppedCanvas.getContext("2d");
  //     croppedCtx.drawImage(
  //       canvas,
  //       scaledX,
  //       scaledY,
  //       scaledWidth,
  //       scaledHeight,
  //       0,
  //       0,
  //       scaledWidth,
  //       scaledHeight
  //     );

  //     // Convert the cropped canvas to a data URL or Blob for further processing
  //     const dataURL = croppedCanvas.toDataURL("image/png"); // Example using PNG format
  //     setCroppedImage(dataURL);
  //   };
  // };
  // const handleCropImage = () => {
  //   const image = new Image();
  //   image.src = originalImage;
  //   const x = setCanvasPreview(image, previewCanvasRef.current, completedCrop);
  //   setCroppedImage(x);
  // };
  const handleCropImage = () => {
    const image = new Image();
    image.src = originalImage;
    image.onload = () => {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const canvas = document.createElement("canvas");
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const base64Image = canvas.toDataURL("image/jpeg");
      setCroppedImage(base64Image);
      setImageWithoutFilter(base64Image);
    };
  };

  const handleRotateImage = () => {
    const image = new Image();
    image.src = croppedImage;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.height;
    canvas.height = image.width;
    ctx.translate(image.height / 2, image.width / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    const base64Image = canvas.toDataURL("image/jpeg");
    setCroppedImage(base64Image);
    setImageWithoutFilter(base64Image);
  };

  const handleToggleGreyscale = () => {
    if (greyscale) {
      setCroppedImage(imageWithoutFilter);
      setGreyscale(!greyscale);
      return;
    }
    const image = new Image();
    image.src = croppedImage;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
    const base64Image = canvas.toDataURL("image/jpeg");
    setCroppedImage(base64Image);
    setGreyscale(!greyscale);
  };

  const handleToggleGradient = () => {
    if (gradient) {
      setCroppedImage(imageWithoutFilter);
      setGradient(!gradient);
      return;
    }
    const image = new Image();
    image.src = croppedImage;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    //add linear gradient
    const lGradient = ctx.createLinearGradient(0, 0, 0, image.height);
    lGradient.addColorStop(0, "rgba(99,102,241,.6)");
    lGradient.addColorStop(1, "rgba(168,85,247,.6)");
    ctx.fillStyle = lGradient;
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.globalCompositeOperation = "lighten";
    ctx.drawImage(image, 0, 0);
    const base64Image = canvas.toDataURL("image/jpeg");
    setCroppedImage(base64Image);
    setGradient(!gradient);
  };

  useEffect(() => {
    const addImage = async () => {
      const photoLink = location.state?.photoLink;
      const capturedImage = location.state?.capturedImage;

      if (!photoLink && !capturedImage) {
        window.location.href = "/";
      }

      let imageSrc = capturedImage;
      if (photoLink && photoLink !== "undefined" && photoLink?.length > 0) {
        try {
          imageSrc = await convertImageToDataURL(photoLink);
        } catch (error) {
          console.log(error, "error");
        }
      }

      const image = new Image();
      image.onload = () => {
        setOriginalImage(imageSrc);
        setCroppedImage(imageSrc);
        setCrop({
          unit: "px",
          x: 0,
          y: 0,
          width: 200,
          height: 200,
        });

        if (previewCanvasRef.current) {
          const canvas = previewCanvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, image.width, image.height);
        }
      };
      image.src = imageSrc;
    };

    if (previewCanvasRef.current) {
      addImage();
    }
  }, [
    location.state?.photoLink,
    location.state?.capturedImage,
    previewCanvasRef,
  ]);

  return (
    <div className="flex bg-gray-200 flex-col min-h-screen items-start justify-start *:w-full">
      <Header />
      {/* <EditImage /> */}
      <main className="flex flex-row items-start justify-start w-full *:basis-1/2 gap-5 p-5">
        <div className="flex flex-col items-start justify-center relative">
          <div>
            <ReactCrop
              aspect={1}
              maxWidth={500}
              maxHeight={500}
              renderSelectionAddon={() => (
                <div className="flex cursor-pointer items-end justify-end gap-3">
                  <button
                    onClick={() => handleCancelCrop()}
                    className="rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-black/70 active:bg-black"
                  >
                    {/* <Save size={14} /> */}
                    cancel
                  </button>
                  <button
                    onClick={() => handleCropImage()}
                    className="rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white shadow-md hover:bg-black/70 active:bg-black"
                  >
                    {/* <Save size={14} /> */}
                    save
                  </button>
                </div>
              )}
              crop={crop}
              onChange={(pixelCrop, percentCrop) => {
                setCrop(percentCrop);
              }}
              onComplete={onCropComplete}
            >
              <img
                src={originalImage}
                alt="edit"
                style={{ maxWidth: "100%", maxHeight: "75vh" }}
              />
            </ReactCrop>
          </div>
        </div>
        <FlexContainer variant="column-start">
          <div>
            <img
              src={croppedImage}
              style={{ maxWidth: "100%", maxHeight: "75vh" }}
              alt="captured"
            />
            <canvas
              ref={previewCanvasRef}
              className="mt-4"
              style={{
                display: "none",
                border: "1px solid black",
                objectFit: "contain",
                width: 500,
                height: 500,
              }}
            />
          </div>
          <FlexContainer variant="row-start" className="gap-3">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleRotateImage()}
            >
              Rotate
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleToggleGreyscale()}
            >
              {greyscale ? "Remove Greyscale" : "Greyscale"}
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleToggleGradient()}
            >
              {gradient ? "Remove Gradient" : "Gradient"}
            </button>
          </FlexContainer>
          <p>Preview</p>{" "}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() =>
              navigate("/AddFrame", { state: { imageData: croppedImage } })
            }
          >
            Add Frame
          </button>
        </FlexContainer>
      </main>
    </div>
  );
};

export default EditPhoto;
