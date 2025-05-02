import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../images/image.jpg';

const Footer = () => {
  return (
    <footer className="bg-[#0B1829] text-white py-6 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Logo and Description */}
          <div className="md:col-span-6 space-y-4">
            <Link to="/home" className="inline-block">
              <img className="h-16 w-auto" src={logo} alt="RC Logo" />
            </Link>
            <p className="text-gray-300 text-sm max-w-xl mt-4">
              Reclaim is a smart and simple lost and found platform that helps people
              report, search, and recover lost items. Whether you've misplaced
              something or found someone else's belongings, Reclaim makes it easy to
              reconnect items with their rightful owners.
            </p>
          </div>

          {/* Empty space for alignment */}
          <div className="md:col-span-3" />

          {/* Links */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex justify-end gap-6">
              <Link to="/how-it-works" className="text-sm text-gray-300 hover:text-white">
                How It Works
              </Link>
              <Link to="/privacy-policy" className="text-sm text-gray-300 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-300 hover:text-white">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-sm text-gray-400">
            © 2025 Reclaim/ITPM-70. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
