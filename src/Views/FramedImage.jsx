import React, { useEffect, useRef } from "react";

const FramedImage = ({ imagePreview, selectedFrame }) => {
  const frameContainerRef = useRef(null);

  useEffect(() => {
    const frameContainer = frameContainerRef.current;
    if (frameContainer) {
      const photo = frameContainer.querySelector("img");
      const frame = frameContainer.querySelector(".frame");

      if (photo && frame) {
        const photoAspectRatio = photo.naturalWidth / photo.naturalHeight;
        const containerAspectRatio =
          frameContainer.offsetWidth / frameContainer.offsetHeight;

        if (photoAspectRatio > containerAspectRatio) {
          // Photo is wider than the container, adjust photo height
          photo.style.width = "100%";
          photo.style.height = "auto";
        } else {
          // Photo is taller than the container, adjust photo width
          photo.style.width = "auto";
          photo.style.height = "100%";
        }

        const photoWidth = photo.offsetWidth;
        const photoHeight = photo.offsetHeight;

        // Adjust frame size based on photo dimensions
        frame.style.width = `${photoWidth}px`;
        frame.style.height = `${photoHeight}px`;
      }
    }
  }, [imagePreview, selectedFrame]);

  return (
    <div ref={frameContainerRef} className="relative">
      {imagePreview && (
        <div>
          <img src={imagePreview} alt="Uploaded" />
          {selectedFrame && (
            <img
              src={selectedFrame.src}
              alt="Selected Frame"
              className="frame absolute top-0 left-0 w-full h-full"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FramedImage;
