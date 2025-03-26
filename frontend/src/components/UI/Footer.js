// src/components/Footer.jsx
import React from "react";

const Footer = ({ companyName = "Lost & Found System", additionalContent }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-2 mt-7 text-center text-gray-400 bg-slate-800">
      <div className="container px-4 mx-auto">
        <p>&copy; {currentYear} {companyName}. All rights reserved.</p>
        
        {/* Optional additional content from props */}
        {additionalContent && (
          <div className="mt-2">
            {additionalContent}
          </div>
        )}
        
        {/* Default footer links that all members get */}
        <div className="flex justify-center mt-4 space-x-4">
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          <span>•</span>
          <a href="/terms" className="hover:text-white">Terms of Service</a>
          <span>•</span>
          <a href="/contact" className="hover:text-white">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;