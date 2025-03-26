import React from "react";
import logo from "../../images/image.jpg"; // Ensure the path is correct

const Footer = ({ companyName = "Lost & Found System" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="absolute bottom-0 w-full py-4 text-center text-gray-400 bg-slate-800">
      <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-6">
          <img src={logo} alt="Company Logo" className="w-12 h-12" />
          <small>
            &copy; {currentYear} {companyName}. All rights reserved.
          </small>
        </div>

        {/* Footer Links */}
        <div className="flex space-x-4 mt-3 md:mt-0">
          <a href="/privacy" className="text-gray-400 hover:text-white text-sm">
            Privacy Policy
          </a>
          <span className="text-gray-500">•</span>
          <a href="/terms" className="text-gray-400 hover:text-white text-sm">
            Terms of Service
          </a>
          <span className="text-gray-500">•</span>
          <a href="/contact" className="text-gray-400 hover:text-white text-sm">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
