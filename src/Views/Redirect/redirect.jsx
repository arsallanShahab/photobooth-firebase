import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { useLocation, useNavigate } from "react-router-dom";
import { validate as uuidValidate } from "uuid";
import Byebye from "../../assets/byebye.png";
import { auth, db } from "../FireBase/Firebase";

const Redirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const uniqueString = new URLSearchParams(location.search).get("id");
  const [validation, setValidation] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userDocExists, setUserDocExists] = useState(false);
  const [redirectFlag, setRedirectFlag] = useState(false);
  const [redirectTimeout, setRedirectTimeout] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setValidation(uuidValidate(uniqueString));
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserDocExists(true);
        } else {
          setUserDocExists(false);
        }
      } else {
        navigate(`/login?id=${uniqueString}`);
        setIsLoggedIn(false);
        setUserDocExists(false);
      }
    });
    return unsubscribe;
  }, [navigate, uniqueString]);

  useEffect(() => {
    if (isLoggedIn && userDocExists) {
      setIsLoading(true);
      const unsubscribe = onSnapshot(
        doc(db, "users", auth.currentUser.uid),
        (doc) => {
          const currentProcess = doc.data().CurrentProcess;
          if (currentProcess.QRCodeUniqueString === uniqueString) {
            updateDoc(doc.ref, { "CurrentProcess.isQRCodeScanned": true });
            setIsLoading(false);
            setRedirectFlag(true);

            // Set a timeout for redirection after 3 seconds
            const timeout = setTimeout(() => {
              redirectUpload();
            }, 3000);
            setRedirectTimeout(timeout);
          } else {
            console.log("Invalid Token or Expired");
            setIsLoading(false);
            setRedirectFlag(false);
            clearTimeout(redirectTimeout);
          }
        }
      );
      return unsubscribe;
    }
  }, [isLoggedIn, uniqueString, userDocExists]);

  const redirectUpload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    navigate(`/PhotoUpload?id=${id}`);
  };

  return (
    <div className="flex bg-gray-200 flex-col items-center justify-center h-screen">
      {isLoading ? (
        <CgSpinner size={64} className="mt-1 animate-spin" />
      ) : userDocExists ? (
        validation ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src={Byebye} alt="Rofabs" />
            <p>Thank you for using our Service</p>
            {redirectFlag && <p>Redirecting in 3 seconds...</p>}
          </div>
        ) : (
          <div>
            <p>Invalid Code</p>
          </div>
        )
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <CgSpinner size={64} className="mt-1 animate-spin" />
          <p>
            Please wait a moment, if you are stuck here then, maybe you came
            from wrong URL
          </p>
        </div>
      )}
    </div>
  );
};

export default Redirect;
