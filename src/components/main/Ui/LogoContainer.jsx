import React from "react";
import { Link } from "react-router-dom";

const LogoContainer = () => {
  return (
    <Link to="/MainPage">
      <img
        className="h-20 md:h-28 w-auto object-contain"
        src="/img/uneg-logo.png"
        alt="UNEG Logo"
      />
    </Link>
  );
};

export default LogoContainer;
