import React from "react";
import { Link } from "react-router-dom";

const LogoContainer = () => {
  return (
    <Link to="/MainPage">
      <img
        className="object-center max-w-48 max-h-10"
        src="/img/uneg-logo.png"
        alt="UNEG Logo"
      />
    </Link>
  );
};

export default LogoContainer;