// src/components/HomePage.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const HomePage = () => {
    return <Navigate to="/knowledge-base" replace />;
};

export default HomePage;