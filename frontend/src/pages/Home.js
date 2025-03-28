import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LostItems from '../components/itemManagement/LostItems';

const Home = () => {
  // const { handleLogout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
          Lost something? Or found something?
          <br />
          <span className="text-orange-500">Let’s fix that.</span>
        </h1>
        <p className="text-gray-600 mb-10">
          Reclaim helps you report, search, and recover lost and found items — quickly and easily.
        </p>
        <button className="bg-orange-500 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition">
          Lost & Found
        </button>
      </div>

      {/* Recently Found Items */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-left">Recently Found Items</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-xl overflow-hidden shadow hover:shadow-md transition bg-white">
              <img
                src="/path-to-image.jpg" // replace with dynamic or static path
                alt="Found item"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-center">Mobile Phone</h3>
                <p className="text-sm text-gray-600 text-center mt-1">
                  A Blue colour Mobile phone with a Case
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Logout Button */}
      {/* <div className="text-center mt-12">
        <button
          onClick={handleLogout}
          className="text-red-500 underline hover:text-red-600"
        >
          Logout
        </button> */}
      {/* </div> */}
    </div>
  );
};

export default Home;
