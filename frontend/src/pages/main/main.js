import React from "react";
import logo from "../../images/image.jpg";

function Main() {
  return (
    <div className="text-white bg-darkBlue min-h-screen">
      <div className="relative px-6 isolate lg:px-8">
        <div className="max-w-2xl py-32 mx-auto sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-white text-balance sm:text-7xl">
              Lost & Found System
            </h1>
            <p className="mt-8 text-lg font-medium text-gray-400 text-pretty sm:text-xl/8">
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
    </div>
  );
}

export default Main;
