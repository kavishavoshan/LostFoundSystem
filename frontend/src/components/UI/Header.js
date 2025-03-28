import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../images/image.jpg"; // Import the logo
import profilePic from "../../images/profile.jpg"; // Import profile image

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="z-10 bg-darkBlue">
      <nav className="flex items-center justify-between p-0 sm:px-2" aria-label="Global">
        <div className="flex sm:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img className="w-auto h-24" src={logo} alt="Your Company Logo" />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <a
            href="/home"
            className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500"
          >
            Home
          </Link>
          <Link to="/itemDashboard" className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500">
            Lost & Found
          </Link>
          <Link to="#" className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500">
            Browse Items
          </Link>
          <Link to="#" className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500">
            About Us
          </Link>
          <Link to="#" className="text-lg font-semibold text-gray-300 hover:text-white hover:underline hover:decoration-orange-500">
            Contact Us
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center space-x-6">
          

          <button className="relative" onClick={() => setVisible(!visible)}>
            <i className="fas fa-bell text-gray-300 hover:text-white text-xl"></i>
            {visible && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
          <img
            src={profilePic}
            alt="Logo"
            className="h-14 w-14 rounded-full border-1 border-white shadow-md mr-4"
            onClick={() => navigate("/userprofile")}
          />

          
        </div>
      </nav>
    </header>
  );
};

export default Header;
