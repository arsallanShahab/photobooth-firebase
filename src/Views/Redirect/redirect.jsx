import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from '../FireBase/Firebase';
import { validate as uuidValidate } from 'uuid';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { CgSpinner } from 'react-icons/cg';

const Redirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const uniqueString = new URLSearchParams(location.search).get('id');
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
                const userRef = doc(db, 'users', user.uid);
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
            const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
                const currentProcess = doc.data().CurrentProcess;
                if (currentProcess.QRCodeUniqueString === uniqueString) {
                    updateDoc(doc.ref, { 'CurrentProcess.isQRCodeScanned': true });
                    setIsLoading(false);
                    setRedirectFlag(true);

                    // Set a timeout for redirection after 3 seconds
                    const timeout = setTimeout(() => {
                        redirectUpload();
                    }, 3000);
                    setRedirectTimeout(timeout);
                } else {
                    console.log('Invalid Token or Expired');
                    setIsLoading(false);
                    setRedirectFlag(false);
                    clearTimeout(redirectTimeout); // Clear the timeout if the condition is not met
                }
            });
            return unsubscribe;
        }
    }, [isLoggedIn, uniqueString, userDocExists]);

    const redirectUpload = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        navigate(`/PhotoUpload?id=${id}`);
    };

    return (
        <div className="flex bg-gray-200 flex-col items-center justify-center h-screen">
            {isLoading ? (
                <CgSpinner size={64} className="mt-1 animate-spin" />
            ) : userDocExists ? (
                validation ? (
                    <div>
                        <p>Thank you for using our Service</p>
                        {redirectFlag && <p>Redirecting in 3 seconds...</p>}
                    </div>
                ) : (
                    <div>
                        <p>Invalid Code</p>
                    </div>
                )
            ) : (
                <div>
                    <p>Oops, Are you sure you came from QR Code?</p>
                </div>
            )}
        </div>
    );
};

export default Redirect;