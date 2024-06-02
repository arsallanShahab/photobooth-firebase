import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header/Header";

const Layout = () => {
  return (
    <div className="flex flex-col bg-gray-200 min-h-screen justify-start items-center">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
