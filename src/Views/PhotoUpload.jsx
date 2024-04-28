import React, { useState } from "react";
import Header from "./Header/Header";
import { useNavigate } from "react-router-dom";
import ExampleImage from '../assets/testImage.jpg';
import { auth, db, storage } from './FireBase/Firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { CgSpinner } from 'react-icons/cg';

const PhotoUpload = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [useExampleImage, setUseExampleImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [photoLink, setPhotoLink] = useState('');

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

  const UploadPhoto = async () => {
    if (imagePreview) {
      setIsUploading(true);
      const user = auth.currentUser;
      if (user) {
        const userPhotoRef = ref(storage, `usersPhotos/${user.uid}`);
        const photoRef = ref(userPhotoRef, `${new Date().getTime()}-photo`);
        const uploadTask = uploadBytesResumable(photoRef, imagePreview);
  
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.log(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
              'CurrentProcess.photoLink': downloadURL,
              'CurrentProcess.photoUploaded': true,
            });
            setPhotoLink(downloadURL);
            setUploadSuccess(true);
            setIsUploading(false);
          }
        );
      }
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
            <span className="text-gray-500 text-2xl">Scan QR</span>
          )}
          {imagePreview ? (
            <label className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Re-Upload!
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          ) : (
            <div className="absolute bottom-2 right-2 flex">
              <label className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer mr-2">
                Scan QR
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleUseExampleImage}>
                Use Example
              </button>
            </div>
          )}
        </div>
        {imagePreview ? (
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={UploadPhoto}>
            UploadPhoto
          </button>
        ) : null}
        {isUploading && (
          <div className="mt-4 flex flex-col items-center">
            <CgSpinner size={32} className="animate-spin mb-2" />
            <div className="w-64 bg-gray-300 rounded-full h-4">
              <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
        {uploadSuccess && (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-green-500 font-bold">Photo uploaded successfully!</p>
            <img src={photoLink} alt="Uploaded" className="max-w-full max-h-96 mt-4" />
          </div>
        )}
      </main>
    </div>
  );
};

export default PhotoUpload;