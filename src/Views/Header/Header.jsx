import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full bg-gray-800 text-white py-4 text-center">
      <h1 className="text-2xl font-bold"><Link to="/">PhotoBooth</Link></h1>
    </header>
  );
};

export default Header;