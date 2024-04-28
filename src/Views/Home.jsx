import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from './Header/Header';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from './FireBase/Firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const Home = () => {
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

  const generateUniqueString = () => {
    const uniqueString = uuidv4();
    return uniqueString;
  };

  const handleClickPhoto = () => {
    navigate('/CameraView');
  };

  const handleUploadPhoto = async () => {
    const uniqueString = generateUniqueString();
    try {
      const user = auth.currentUser;
      if (user) {
        const usersRef = collection(db, 'users');
        const userDocRef = doc(usersRef, user.uid);
        await setDoc(userDocRef, {
          CurrentProcess: {
            QRCodeUniqueString: uniqueString,
            isQRCodeScanned: false,
          },
        }, { merge: true });
        navigate(`/QRCode?id=${uniqueString}`);
      } else {
        console.error('User is not authenticated');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    }).catch((error) => {
      console.error('Error signing out:', error);
      // Handle error gracefully, show toast or alert
    });
  };

  return (
    <div className="flex bg-gray-200 flex-col items-center justify-center h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col text-2xl font-bold mb-16">
          <p>Welcome to Photo Booth</p>
        </div>
        <div>
          <button
            className="mr-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleClickPhoto}
          >
            Click a photo!
          </button>
          <button
            className="mr-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleUploadPhoto}
          >
            Upload
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
