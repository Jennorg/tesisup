import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="grid place-items-center w-dvw h-dvh bg-blue-600">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-[90%] max-w-sm h-[500px] flex flex-col justify-start text-white space-y-5">
        
        {}
        <img
          src="/img/uneg-logo.png"
          alt="Logo UNEG"
          className="mx-auto w-20 h-20 mb-1"
        />

        {}
        <h1 className="text-3xl font-bold text-center mb-4 mt-1">Digitalys</h1>

        {}
        <div className="flex flex-col gap-5 w-full px-3 mt-2">
          <div className="bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg transition">
            <Link
              to="/login"
              className="block py-3 text-white text-lg font-medium text-center"
            >
              Login
            </Link>
          </div>
          <div className="bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg transition">
            <Link
              to="/signUp"
              className="block py-3 text-white text-lg font-medium text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;