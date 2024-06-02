import imageCompression from "browser-image-compression";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { CgSpinner, CgSpinnerAlt } from "react-icons/cg";
import { useLocation } from "react-router-dom";
import { validate as uuidValidate } from "uuid";
import ExampleImage from "../assets/testImage.jpg";
import { auth, db, storage } from "./FireBase/Firebase";
import Header from "./Header/Header";

//Images
import Byebye from "../assets/byebye.png";
import girl from "../assets/girl.png";

const PhotoUpload = () => {
  const location = useLocation();
  const uniqueString = new URLSearchParams(location.search).get("id");

  const [validation, setValidation] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isMismatch, setMismatch] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [useExampleImage, setUseExampleImage] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [photoLink, setPhotoLink] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [isPhotoUploaded, setIsPhotoUploaded] = useState(false);

  const listenForCurrentProcessUpdates = () => {
    const user = auth.currentUser;
    if (user) {
      setValidation(uuidValidate(uniqueString));
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const currentProcess = doc.data().CurrentProcess;

          if (currentProcess.QRCodeUniqueString === uniqueString) {
            if (
              (currentProcess && currentProcess.isDelete === true) ||
              currentProcess.disablePhotoUpload === true ||
              currentProcess.isCancelled === true
            ) {
              setIsDeleted(true);
            } else {
              setIsDeleted(false);
            }
          } else {
            setMismatch(true);
          }
        }
      });

      return unsubscribe;
    }
  };

  useEffect(() => {
    const unsubscribe = listenForCurrentProcessUpdates();
    return unsubscribe;
  });

  console.log(isMismatch);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/") && file.size > 0) {
      setImagePreview(URL.createObjectURL(file));
      setUseExampleImage(false);
      setSelectedFile(file);
      setIsPhotoUploaded(false);
      const compressedFile = await compressImage(file);
      setSelectedFile(compressedFile);
      setIsPhotoUploaded(false);
    } else {
      // Handle invalid file type or empty file
    }
  };

  const handleUseExampleImage = () => {
    setImagePreview(ExampleImage);
    setUseExampleImage(true);
    setSelectedFile(null);
  };

  const UploadPhoto = async () => {
    if (imagePreview) {
      setIsUploading(true);
      const user = auth.currentUser;
      if (user) {
        const userPhotoRef = ref(storage, `usersPhotos/${user.uid}`);
        const photoRef = ref(userPhotoRef, `${user.uid}-photo`);
        const uploadTask = uploadBytesResumable(
          photoRef,
          useExampleImage ? ExampleImage : selectedFile,
          null
        );

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.log(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              "CurrentProcess.photoLink": downloadURL,
              "CurrentProcess.photoUploaded": true,
            });

            setPhotoLink(downloadURL);
            setUploadSuccess(true);
            setIsUploading(false);
            setIsPhotoUploaded(true);
          }
        );
      }
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    const user = auth.currentUser;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        "CurrentProcess.isCancelled": true,
      });
    } catch (error) {
      console.log("Error", error);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-200 min-h-screen">
      {isMismatch ? (
        <main className="flex-1 flex flex-col items-center justify-center">
          <img src={girl} alt="Rofabs" className="min-h-full max-h-96" />

          <p className="pr-4 pl-4">Maybe you came from wrong place..</p>
        </main>
      ) : validation === null ? (
        <main className="flex-1 flex flex-col items-center justify-center">
          <img src={girl} alt="Rofabs" className="min-h-full max-h-96" />
          <CgSpinnerAlt size={32} className="animate-spin mb-2 mt-4" />
          <p className="pr-4 pl-4">
            if you are stuck more than 3 seconds here then
          </p>
          <p className="pr-4 pl-4">something went wrong...</p>
        </main>
      ) : validation ? (
        isDeleted ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src={Byebye} alt="Rofabs" />
            <p>Thank you for using our services.</p>
          </div>
        ) : (
          <div className="flex flex-col bg-gray-200 min-h-screen">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center">
              <div className="w-96 h-96 bg-gray-300 rounded-lg flex items-center justify-center mb-4 relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Uploaded"
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <span className="text-gray-500 text-2xl">
                    Your Photo Here!
                  </span>
                )}
                {imagePreview ? (
                  <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                    Re-Upload!
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="absolute bottom-2 right-2 flex">
                    <div className="flex flex-row">
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
                        onClick={handleCancel}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? (
                          <span>Please wait</span>
                        ) : (
                          <span>Cancel</span>
                        )}
                      </button>
                    </div>
                    <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer mr-2">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-3"
                      onClick={handleUseExampleImage}
                    >
                      Use Example
                    </button>
                  </div>
                )}
              </div>
              {imagePreview && !isPhotoUploaded ? (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={UploadPhoto}
                >
                  UploadPhoto
                </button>
              ) : null}
              {isUploading && (
                <div className="mt-4 flex flex-col items-center">
                  <CgSpinner size={32} className="animate-spin mb-2" />
                  <div className="w-64 bg-gray-300 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {uploadSuccess && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="text-green-500 font-bold">
                    Photo uploaded successfully!
                  </p>

                  <p className="text-black-500 font-bold">
                    Please Click On Processed With Photo In Machine Screen
                  </p>
                </div>
              )}
            </main>
          </div>
        )
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center">
          <h1>Where did you come from?</h1>
        </main>
      )}
    </div>
  );
};

export default PhotoUpload;
