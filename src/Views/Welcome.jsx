import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./FireBase/Firebase";
import Header from "./Header/Header";

const Welcome = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log(user, "user");
      if (!user) {
        navigate("/Login");
        // setUser(null);
      } else {
        setUser(user);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetStarted = () => {
    navigate("/Home");
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
            onClick={handleGetStarted}
          >
            Get Started!
          </button>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
