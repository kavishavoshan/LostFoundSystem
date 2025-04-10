import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import logo from "../../images/image.jpg"; // Import the logo
import Profile from "../../images/profile.jpg";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="z-10 bg-darkBlue">
      <nav
        className="flex items-center justify-between p-0 sm::px-2"
        aria-label="Global"
      >
        <div className="flex sm:flex-1">
          <a href="/home" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              className="w-auto h-24"
              src={logo} // Use the imported logo
              alt="Your Company Logo"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400" // Adjusted mobile menu button color
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <a
            href="/home"
            className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500"
          >
            Home
          </a>
          <a
            href="/itemDashboard"
            className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500"
          >
            Lost & Found
          </a>
          <a
            href="/feature"
            className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500"
          >
            Browse Items
          </a>
          <a
            href="#"
            className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500"
          >
            About Us
          </a>
          <a
            href="#"
            className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500"
          >
            Contact Us
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center space-x-6">
          

          <button className="relative" onClick={() => setVisible(!visible)}>
            <i className="fas fa-bell text-gray-300 hover:text-white text-xl"></i>
            {visible && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
          <img
            src={Profile}
            alt="Logo"
            className="h-12 w-12 rounded-full border-1 border-white shadow-md mr-4"
            onClick={() => navigate("/userprofile")}
          />

          
        </div>
      </nav>
    </header>
  );
};

export default Header;