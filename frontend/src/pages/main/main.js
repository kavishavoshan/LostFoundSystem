import React, { useState } from 'react';
 // Import the logo
import Footer from '../../components/UI/Footer';
import Header from '../../components/UI/Header';

function Main() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="text-white bg-darkBlue h-screen"> {/* Changed background and default text color */}
      <Header />

      <div className="relative px-6 isolate pt-14 lg:px-8">
        {/* ... (rest of your component content) ... */}
        <div className="max-w-2xl py-32 mx-auto sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            {/* ... (Announcing section) ... */}
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-white text-balance sm:text-7xl"> {/* Changed Header color */}
              Lost & Found System
            </h1>
            <p className="mt-8 text-lg font-medium text-gray-400 text-pretty sm:text-xl/8"> {/* Changed paragraph color */}
              Lost & Found System is a website that helps people recover lost items and return found belongings. Users can report, search, and connect with others to reunite items with their rightful owners easily.
            </p>
            <div className="flex items-center justify-center mt-10 gap-x-6">
              <a
                href="#"
                className="py-3 text-lg font-semibold text-white bg-indigo-600 px-9 rounded-xl hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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