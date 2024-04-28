import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import Header from "./Header/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { validate as uuidValidate } from 'uuid';
import { auth } from './FireBase/Firebase';

const QRCodeComponent = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate('/login');
            } else {
                console.log('User is signed in')
            }
        });

        return unsubscribe;
    }, [navigate]);


    const [Validation, setValidation] = useState(true);

    const location = useLocation();
    const uniqueString = new URLSearchParams(location.search).get('id');
    const redirectUrl = `http://192.168.1.9:3000/redirect?id=${uniqueString}`;


    useEffect(() => {
        setValidation(uuidValidate(uniqueString));
    }, [uniqueString])

    const handleGoBack = () => {
        navigate("/Home")
    }

    return (
        <div className="flex flex-col bg-gray-200 min-h-screen">
            <Header />

            {Validation ?
                (
                    <main className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-96 h-96 bg-gray-300 rounded-lg flex items-center justify-center mb-4 relative">
                            <QRCode
                                value={redirectUrl}
                                size={356}
                            />
                        </div>

                        <h1>
                            Please Scan the QR Code
                        </h1>

                        <div className="flex flex-col">
                            <button className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleGoBack}>
                                Go Back
                            </button>
                        </div>
                    </main>
                ) : (
                    <main className="flex-1 flex flex-col items-center justify-center">
                        <h1>
                            Where did you come from?
                        </h1>

                    </main>
                )}
        </div>
    );
};

export default QRCodeComponent;
