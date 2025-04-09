import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="grid place-items-center w-dvw h-dvh">
            <h1>Home</h1>
            <Link to="/login">Login</Link>
            <Link to="/signUp">Sign Up</Link>
            <Link to="/MainPage">Main</Link>
        </div>
    );
}

export default Home;