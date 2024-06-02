import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { auth } from "./FireBase/Firebase";
import Header from "./Header/Header";

const Login = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const recaptchaContainerRef = React.createRef();
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  useEffect(() => {
    const initializeRecaptcha = () => {
      const recaptchaContainer = recaptchaContainerRef.current;
      if (recaptchaContainer) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          recaptchaContainer,
          {
            size: "invisible",
            callback: () => {},
            "expired-callback": () => {
              window.recaptchaVerifier.recaptcha.reset();
            },
            "error-callback": () => {
              window.recaptchaVerifier.recaptcha.reset();
            },
          }
        );
        setRecaptchaVerifier(window.recaptchaVerifier);
      }
    };

    initializeRecaptcha();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(countdown - 1), 1000);
    } else {
      setShowOtpInput(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const sendOTP = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (phoneNumber.length < 10) {
        toast.error("Please enter 10 digit phone number");
        return;
      }

      const formattedPhoneNumber = `+91${phoneNumber}`;
      console.log("Formatted Phone Number:", formattedPhoneNumber); // Debug
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifier
      );
      setCountdown(60);
      setShowOtpInput(true);
      window.confirmationResult = confirmationResult;
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log(countdown);

  const verifyOTP = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (otp.length < 6) {
        toast.error("Please Enter Valid 6 Digit OTP");
        return;
      }
      await window.confirmationResult.confirm(otp);

      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");

      if (id) {
        navigate(`/redirect?id=${id}`);
        toast.error("Please Upload Your Photo");
      } else {
        navigate("/Home");
        toast.error("Welcome To Photo Booth");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("Invalid OTP. Please try again.");
      toast.error("Oops, Wrong Otp!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col bg-gray-200 h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        <Toaster toastOptions={{ duration: 4000 }} />
        <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
        <div className="w-80 flex flex-col gap-4 rounded-lg p-4">
          <h1 className="text-center leading-normal text-black font-medium text-3xl mb-6">
            Welcome to Photo Booth
          </h1>
          {showOtpInput ? (
            <>
              <div className="bg-white text-black-500 w-fit mx-auto p-4 rounded-full">
                <BsFillShieldLockFill size={30} color="black" />
              </div>
              <label
                htmlFor="otp"
                className="font-bold text-xl text-black text-center"
              >
                Enter your OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                pattern="\d*"
                className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={verifyOTP}
                className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                disabled={isLoading}
              >
                {isLoading && (
                  <CgSpinner size={20} className="mt-1 animate-spin" />
                )}
                <span>Verify OTP</span>
              </button>
            </>
          ) : (
            <>
              <div className="bg-gray-800 text-emerald-500 w-fit mx-auto p-4 rounded-full">
                <BsTelephoneFill size={30} />
              </div>
              <label
                htmlFor=""
                className="font-bold text-xl text-black text-center"
              >
                Verify your phone number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 rounded-l-md border border-r-0 border-gray-300">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  maxLength={10}
                  className="rounded-none rounded-r-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={sendOTP}
                className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
                disabled={isLoading || countdown > 0}
              >
                {isLoading && (
                  <CgSpinner size={20} className="mt-1 animate-spin" />
                )}
                <span>
                  {countdown > 0
                    ? `Resend OTP in ${countdown} seconds`
                    : "Send code via SMS"}
                </span>
              </button>
            </>
          )}
          {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
        </div>
      </main>
    </section>
  );
};

export default Login;
