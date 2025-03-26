import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/components/Home";
import Login from "@/components/Auth/Login";
import SignUp from "@/components/Auth/Signup";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />}></Route>
    </Routes>
  );
}

export default App;