import React, { useState } from "react";
// Import the logo
import Footer from "../../components/UI/Footer";
import logo from "../../images/image.jpg"; // Ensure the path is correct

function Main() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="text-white bg-darkBlue h-screen">
      {" "}
      {/* Changed background and default text color */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex items-center justify-between p-2 lg:px-5"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="w-auto h-28"
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
          <div className="hidden lg:flex lg:gap-x-28">
            
            <a
              href=""
              className="text-lg font-semibold text-gray-300 hover:text-white"
            >
              Features
            </a>
            <a
              href="/comunity"
              className="text-lg font-semibold text-gray-300 hover:text-white"
            >
              Community
            </a>
            <a
              href="/news"
              className="text-lg font-semibold text-gray-300 hover:text-white"
            >
              News
            </a>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <button
              onClick={() => (window.location.href = "/adminlogin")}
              className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-lg hover:bg-white hover:text-gray-900 transition"
            >
              Admin login
            </button>
          </div>
        </nav>
        
      </header>
      <div className="relative px-6 isolate pt-14 lg:px-8">
        {/* ... (rest of your component content) ... */}
        <div className="max-w-2xl py-32 mx-auto sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            {/* ... (Announcing section) ... */}
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-white text-balance sm:text-7xl">
              {" "}
              {/* Changed Header color */}
              Lost & Found System
            </h1>
            <p className="mt-8 text-lg font-medium text-gray-400 text-pretty sm:text-xl/8">
              {" "}
              {/* Changed paragraph color */}
              Lost & Found System is a website that helps people recover lost
              items and return found belongings. Users can report, search, and
              connect with others to reunite items with their rightful owners
              easily.
            </p>
            <div className="flex items-center justify-center mt-10 gap-x-6">
              <a
                href="/login"
                className="py-3 text-lg font-semibold text-white bg-primary px-9 rounded-xl hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Main;
