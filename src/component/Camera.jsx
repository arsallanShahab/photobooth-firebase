import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const Camera = () => {
  const [isPermissionGiven, setIsPermissionGiven] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = React.useRef(null);

  const navigate = useNavigate();

  const handleUserMedia = (mediaStream) => {
    if (mediaStream) {
      setIsPermissionGiven(true);
    } else {
      setIsPermissionGiven(false);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  return (
    <div>
      <div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          onUserMedia={handleUserMedia}
          size={"100%"}
          //2480 x 3508 this is a4 size resolution but i want to use the a4 aspect ratio for the webcam and i want to use a custom height but the width should be calculated based on the aspect ratio
        />
        {isPermissionGiven && (
          <button
            className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={capture}
          >
            Capture photo
          </button>
        )}
        {capturedImage && (
          <div>
            <img src={capturedImage} alt="Captured" />
            <button
              className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() =>
                navigate("/EditPhoto", { state: { capturedImage } })
              }
            >
              Edit Photo
            </button>
          </div>
        )}
      </div>
      {!isPermissionGiven && (
        <div>Please give permission to access the camera</div>
      )}
    </div>
  );
};

export default Camera;
