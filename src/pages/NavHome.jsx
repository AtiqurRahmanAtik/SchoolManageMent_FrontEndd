// src/layouts/NavHome.jsx
import React from 'react';
import { Outlet } from "react-router-dom";
import NavigationBar from '../components/NavigationBar';
// Import your Navbar and Footer here if you have them!
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';

const NavHome = () => {
    return (
        <>
            <NavigationBar />
            
            <main className="min-h-screen bg-gray-50">
                {/* When URL is "/", Outlet becomes HomePage 
                  When URL is "/product/:id", Outlet becomes ProductDetails 
                */}
                <Outlet /> 
            </main>

            {/* <Footer /> */}  {/* If you have a footer, it goes here */}
        </>
    );
};

export default NavHome;