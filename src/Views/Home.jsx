import React from 'react';
import { useNavigate } from "react-router-dom";
import Header from './Header/Header';
const Home = () => {

    const navigate = useNavigate();
    const handleClickPhoto = () => {

        navigate('/CameraView')
    }

    return (
        <div className="flex bg-gray-200 flex-col items-center justify-center h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleClickPhoto}
                >
                    Click a photo!
                </button>
            </main>
        </div>
    );
}

export default Home;