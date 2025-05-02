import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../images/image.jpg';

const Footer = () => {
  return (
    <footer className="bg-[#0B1829] text-white py-2"> {/* Reduced to py-2 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center"> {/* Reduced gap to 4, changed to items-center */}
          {/* Logo and Description */}
          <div className="md:col-span-6 space-y-1"> {/* Reduced space-y to 1 */}
            <Link to="/home" className="inline-block">
              <img className="h-10 w-auto" src={logo} alt="RC Logo" /> {/* Reduced to h-10 */}
            </Link>
            <p className="text-gray-300 text-[0.7rem] max-w-xl mt-1 leading-tight"> {/* Smaller text, tighter leading */}
            Reclaim is a smart and simple lost and found platform that helps people
              report, search, and recover lost items. Whether you've misplaced
              something or found someone else's belongings, Reclaim makes it easy to
              reconnect items with their rightful owners.

            </p>
          </div>

          {/* Empty space for alignment */}
          <div className="md:col-span-3" />

          {/* Links */}
          <div className="md:col-span-3">
            <div className="flex justify-end gap-3"> {/* Reduced gap to 3 */}
              <Link to="/how-it-works" className="text-[0.7rem] text-gray-300 hover:text-white">
                How It Works
              </Link>
              <Link to="/privacy-policy" className="text-[0.7rem] text-gray-300 hover:text-white">
                Privacy
              </Link>
              <Link to="/terms" className="text-[0.7rem] text-gray-300 hover:text-white">
                Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-2 pt-2 border-t border-gray-800"> {/* Reduced margins */}
          <p className="text-center text-[0.6rem] text-gray-400"> {/* Even smaller text */}
            © 2025 Reclaim/ITPM-70. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;