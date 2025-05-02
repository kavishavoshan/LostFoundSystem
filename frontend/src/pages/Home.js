import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getFoundItems } from '../api/foundItems';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const items = await getFoundItems();
        // Get the 5 most recent items
        const recent = items
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentItems(recent);
      } catch (error) {
        console.error("Error fetching recent items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
          Lost something? Or found something?
          <br />
          <span className="text-orange-500">Let's fix that.</span>
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
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-xl overflow-hidden shadow hover:shadow-md transition bg-white animate-pulse">
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recentItems.map((item) => (
              <div key={item._id} className="border rounded-xl overflow-hidden shadow hover:shadow-md transition bg-white">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.itemName}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-center">{item.itemName}</h3>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
            {recentItems.length === 0 && (
              <div className="col-span-full text-center text-gray-500">
                No recently found items
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
