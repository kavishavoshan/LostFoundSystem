// src/components/Footer.jsx
import React from "react";

const Footer = ({ companyName = "Lost & Found System" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="absolute bottom-0 w-full py-3 mt-6 text-center text-gray-400 bg-slate-800">
      <div className="container px-2 flex items-center justify-between mx-auto">
        <small>
          &copy; {currentYear} {companyName}. All rights reserved.
        </small>

        {/* Default footer links that all members get */}
        <div className="flex space-x-2">
          <small href="/privacy" className="hover:text-white">
            Privacy Policy
          </small>
          <span>•</span>
          <small href="/terms" className="hover:text-white">
            Terms of Service
          </small>
          <span>•</span>
          <small href="/contact" className="hover:text-white">
            Contact Us
          </small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
