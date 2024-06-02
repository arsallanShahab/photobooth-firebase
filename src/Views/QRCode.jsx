import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import QRCode from "qrcode.react";
import React, { useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { useLocation, useNavigate } from "react-router-dom";
import { validate as uuidValidate } from "uuid";
import Rofabs from "../assets/ROFABS.jpg";
import { auth, db } from "./FireBase/Firebase";
import Header from "./Header/Header";

const QRCodeComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const uniqueString = new URLSearchParams(location.search).get("id");
  const redirectUrl = `https://photobooth-firebase.vercel.app/redirect?id=${uniqueString}`;

  const [validation, setValidation] = useState(null);
  const [isQRCodeScanned, setIsQRCodeScanned] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoLink, setPhotoLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [unsubscribeSnapshot, setUnsubscribeSnapshot] = useState(null);

  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        if (user) {
          setValidation(uuidValidate(uniqueString));

          const userRef = doc(db, "users", user.uid);
          const unsubscribeFromSnapshot = onSnapshot(
            userRef,
            (doc) => {
              const currentProcess = doc.data().CurrentProcess;

              setIsQRCodeScanned(currentProcess.isQRCodeScanned);
              setPhotoUploaded(currentProcess.photoUploaded);
              setPhotoLink(currentProcess.photoLink || "");
              setIsCancelled(currentProcess.isCancelled || false);
            },
            (error) => {
              console.error("Error fetching real-time data:", error);
            }
          );

          setUnsubscribeSnapshot(() => unsubscribeFromSnapshot);

          return () => {
            unsubscribeFromSnapshot();
          };
        } else {
          navigate("/login");
        }
      },
      (error) => {
        console.error("Error checking authentication state:", error);
      }
    );

    return unsubscribe;
  }, [navigate, uniqueString]);

  const handleGoBack = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const usersRef = collection(db, "users");
        const userDocRef = doc(usersRef, user.uid);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
        await setDoc(userDocRef, {
          CurrentProcess: {
            isDelete: true,
          },
        });
        navigate("/Home");
      } else {
        console.log("User is not authenticated");
      }
    } catch (error) {
      console.log("Something went wrong: ", error);
    } finally {
      setLoading(false);
    }
  };
  console.log(photoLink, "photoLink");

  const handleProcessedWithPhoto = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          "CurrentProcess.disablePhotoUpload": true,
        });
        navigate(`/SelectFrame?id=${uniqueString}`, {
          state: { photoLink: photoLink },
        });
      } else {
        console.log("User is not authenticated");
      }
    } catch (error) {
      console.log("Something went wrong: ", error);
    }
  };

  return (
    <div className="flex flex-col bg-gray-200 min-h-screen">
      <Header />
      {validation === null ? (
        <main className="flex-1 flex flex-col items-center justify-center">
          <p>Loading...</p>
        </main>
      ) : validation ? (
        isCancelled ? (
          <main className="flex-1 flex flex-col items-center justify-center">
            <p>
              You have cancelled the process. Thank you for using our service.
            </p>
            {setTimeout(() => {
              navigate("/Home"); // Replace '/welcome' with the appropriate route for the welcome page
            }, 3000)}
          </main>
        ) : (
          <main className="flex-1 flex flex-col items-center justify-center">
            {!isQRCodeScanned ? (
              <>
                <div className="w-96 h-96 bg-gray-300 rounded-lg flex items-center justify-center mb-4 relative">
                  <QRCode value={redirectUrl} size={356} />
                </div>
                <h1>Please Scan the QR Code</h1>
                <p>or go to this url: {redirectUrl}</p>
              </>
            ) : !photoUploaded ? (
              <>
                <img
                  className="max-w-full max-h-64"
                  src={Rofabs}
                  alt="Rofabs"
                />
                <CgSpinner size={64} className="mt-1 animate-spin" />
                <p>Waiting for your picture upload to be completed</p>
              </>
            ) : (
              <>
                <img
                  src={photoLink}
                  alt="Uploaded"
                  className="max-w-full max-h-96"
                />
                <button
                  className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() =>
                    navigate("/EditPhoto", { state: { photoLink } })
                  }
                >
                  Edit Photo
                </button>
                {/* <button
                  className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleProcessedWithPhoto}
                >
                  Processed with Photo
                </button> */}
              </>
            )}
            <div className="flex flex-row">
              <button
                className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleGoBack}
                disabled={loading}
              >
                {loading && (
                  <CgSpinner size={20} className="mt-1 animate-spin" />
                )}
                <span> Go Back </span>
              </button>
            </div>
          </main>
        )
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center">
          <h1>Where did you come from?</h1>
        </main>
      )}
    </div>
  );
};

export default QRCodeComponent;
