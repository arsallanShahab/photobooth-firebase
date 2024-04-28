import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import Header from "./Header/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { validate as uuidValidate } from 'uuid';
import { auth, db } from './FireBase/Firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { CgSpinner } from 'react-icons/cg';

const QRCodeComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const uniqueString = new URLSearchParams(location.search).get('id');
  const redirectUrl = `https://photobooth-nine-sable.vercel.app/redirect?id=${uniqueString}`;

  const [validation, setValidation] = useState(null);
  const [isQRCodeScanned, setIsQRCodeScanned] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoLink, setPhotoLink] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setValidation(uuidValidate(uniqueString));

        const userRef = doc(db, 'users', user.uid);
        const unsubscribeFromSnapshot = onSnapshot(userRef, (doc) => {
          const currentProcess = doc.data().CurrentProcess;

          setIsQRCodeScanned(currentProcess.isQRCodeScanned);
          setPhotoUploaded(currentProcess.photoUploaded);
          setPhotoLink(currentProcess.photoLink || '');
        });

        return () => {
          unsubscribeFromSnapshot();
        };
      } else {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate, uniqueString]);

  const handleGoBack = () => {
    navigate("/Home");
  };

  return (
    <div className="flex flex-col bg-gray-200 min-h-screen">
      <Header />
      {validation === null ? (
        <main className="flex-1 flex flex-col items-center justify-center">
          <p>Loading...</p>
        </main>
      ) : validation ? (
        <main className="flex-1 flex flex-col items-center justify-center">
          {!isQRCodeScanned ? (
            <>
              <div className="w-96 h-96 bg-gray-300 rounded-lg flex items-center justify-center mb-4 relative">
                <QRCode value={redirectUrl} size={356} />
              </div>
              <h1>Please Scan the QR Code</h1>
            </>
          ) : !photoUploaded ? (
            <>
              <CgSpinner size={64} className="mt-1 animate-spin" />
              <p>Waiting for your picture upload to be completed</p>
            </>
          ) : (
            <>
              <img src={photoLink} alt="Uploaded" className="max-w-full max-h-96" />
              <button className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Processed with Photo
              </button>
            </>
          )}
          <div className="flex flex-col">
            <button
              className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleGoBack}
            >
              Go Back
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center">
          <h1>Where did you come from?</h1>
        </main>
      )}
    </div>
  );
};

export default QRCodeComponent;