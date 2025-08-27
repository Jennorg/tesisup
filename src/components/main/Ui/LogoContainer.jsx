import React from "react";
import { Link } from "react-router-dom";

const LogoContainer = () => {
  return (
    <Link to="/MainPage">
      <img
        className="h-12 w-auto object-contain"
        src="/img/uneg-logo.png"
        alt="UNEG Logo"
      />
    </Link>
  );
};

export default LogoContainer;
