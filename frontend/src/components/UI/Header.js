// src/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../images/image.jpg"; // Import the logo

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
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
        <div className="hidden lg:flex lg:gap-x-12">
          <a
            href="/itemDashboard"
            className="text-lg font-semibold text-gray-300 hover:text-white"
          >
            {" "}
            {/* Adjusted desktop menu text color */}
            Item
          </a>
          <a
            href="#"
            className="text-lg font-semibold text-gray-300 hover:text-white"
          >
            Features
          </a>
          <a
            href="#"
            className="text-lg font-semibold text-gray-300 hover:text-white"
          >
            Community
          </a>
          <a
            href="#"
            className="text-lg font-semibold text-gray-300 hover:text-white"
          >
            News
          </a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            href="/login"
            className="text-lg font-semibold text-gray-300 hover:text-white"
          >
            {" "}
            {/* Adjusted login text color */}
            Log in <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 z-50"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full px-6 py-6 overflow-y-auto bg-slate-800 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            {" "}
            {/* Mobile menu background adjusted */}
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  className="w-auto h-8"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  alt=""
                />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flow-root mt-6">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="py-6 space-y-2">
                  <a
                    href="#"
                    className="block px-3 py-2 -mx-3 font-semibold text-gray-300 rounded-lg text-base/7 hover:bg-slate-700" // Mobile menu items color adjusted
                  >
                    Item
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 -mx-3 font-semibold text-gray-300 rounded-lg text-base/7 hover:bg-slate-700"
                  >
                    Features
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 -mx-3 font-semibold text-gray-300 rounded-lg text-base/7 hover:bg-slate-700"
                  >
                    Community
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 -mx-3 font-semibold text-gray-300 rounded-lg text-base/7 hover:bg-slate-700"
                  >
                    News
                  </a>
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-slate-700"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
