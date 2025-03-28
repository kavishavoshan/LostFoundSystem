import React, { useState } from "react";
import logo from "../../images/image.jpg";
import comunity from "../../images/comunity.jpg";

function Community() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Report Lost Item", href: "#" },
    { name: "Found Items", href: "#" },
    { name: "View All Items", href: "#" },
    { name: "Success Stories", href: "#" },
  ];

  const stats = [
    { name: "Items Recovered", value: "1,200+" },
    { name: "Happy Users", value: "500+" },
    { name: "Active Volunteers", value: "40" },
    { name: "Days to Recovery", value: "3.5 avg" },
  ];

  return (
    <div className="text-white bg-darkBlue min-h-screen">
      {/* Fixed Header with decreased width */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex items-center justify-between p-2 lg:px-4"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Lost and Found System</span>
              <img
                className="w-auto h-16 lg:h-20" // Reduced logo size
                src={logo}
                alt="Lost and Found System Logo"
              />
            </a>
          </div>
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
            {" "}
            {/* Reduced gap between nav items */}
            <a
              href=""
              className="text-lg font-semibold text-gray-300 hover:text-white"
            >
              Features
            </a>
            <a
              href="/feature"
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
              className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-white hover:text-gray-900 transition" // Reduced button size
            >
              Admin Login
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        {" "}
        {/* Reduced top padding to account for smaller header */}
        <div
          className="w-full h-full min-h-[calc(100vh-6rem)] bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: `url(${comunity})`,
          }}
        >
          <div className="container mx-auto px-6 lg:px-8">
            {/* Rest of your content remains the same */}
            <div className="max-w-2xl lg:max-w-4xl mx-auto text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Reuniting People <br />
                <span className="text-indigo-400">With Their Belongings</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-300">
                Our lost and found system helps you recover lost items quickly
                and easily. Whether you've lost something valuable or found an
                item, we're here to help make connections.
              </p>
            </div>

            {/* Links Section */}
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="group rounded-lg border border-gray-700 px-6 py-4 hover:border-indigo-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-white group-hover:text-indigo-400">
                        {link.name}
                      </span>
                      <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-24 max-w-4xl mx-auto">
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat) => (
                  <div
                    key={stat.name}
                    className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center backdrop-blur-sm"
                  >
                    <dd className="text-4xl font-bold text-indigo-400">
                      {stat.value}
                    </dd>
                    <dt className="mt-2 text-sm font-medium text-gray-300">
                      {stat.name}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Community;
