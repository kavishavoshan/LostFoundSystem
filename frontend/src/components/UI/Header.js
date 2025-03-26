// src/components/Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            {/* Replace with your logo */}
            <img
              className="w-auto h-8"
              src="/your-logo.svg"
              alt="Company Logo"
            />
          </Link>
        </div>
        
        {/* Mobile menu button */}
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
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          <Link to="/item" className="text-lg font-semibold text-gray-300 hover:text-white">
            Item
          </Link>
          <Link to="/features" className="text-lg font-semibold text-gray-300 hover:text-white">
            Features
          </Link>
          <Link to="/community" className="text-lg font-semibold text-gray-300 hover:text-white">
            Community
          </Link>
          <Link to="/news" className="text-lg font-semibold text-gray-300 hover:text-white">
            News
          </Link>
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link to="/login" className="text-lg font-semibold text-gray-300 hover:text-white">
            Log in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full px-6 py-6 overflow-y-auto bg-slate-800 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  className="w-auto h-8"
                  src="/your-logo.svg"
                  alt="Company Logo"
                />
              </Link>
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
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flow-root mt-6">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="py-6 space-y-2">
                  <Link
                    to="/item"
                    className="block px-3 py-2 -mx-3 font-semibold text-gray-300 rounded-lg text-base/7 hover:bg-slate-700"
                  >
                    Item
                  </Link>
                  <Link
                    to="/features"
                    className="block px-3 py-2 -mx-3 font-semibold text-gray-300 rounded-lg text-base/7 hover:bg-slate-700"
                  >
                    Features
                  </Link>
                  <Link
                    to="/community"
                    className="block px-3 py-2 -mx-3 font-semibold text-gray-300 rounded-lg text-base/7 hover:bg-slate-700"
                  >
                    Community
                  </Link>
                  <Link
                    to="/news"
                    className="block px-3 py-2 -mx-3 font-semibold text-gray-300 rounded-lg text-base/7 hover:bg-slate-700"
                  >
                    News
                  </Link>
                </div>
                <div className="py-6">
                  <Link
                    to="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-slate-700"
                  >
                    Log in
                  </Link>
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