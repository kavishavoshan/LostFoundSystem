import React, { useEffect, useState } from "react";
import { getFoundItems } from "../../api/foundItems";
import { useAuth } from '../../context/AuthContext';
import ItemForm from './ItemForm';
import "../../styles/itemManagementCSS.css";

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getFoundItems();
      setItems(data);
    } catch (error) {
      console.error("Error fetching found items:", error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchItems(); // Refresh the list after form closes
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Found Items</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200"
        >
          Report Found Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Report Found Item</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <ItemForm type="found" onClose={handleFormClose} />
          </div>
        </div>
      )}

      {/* Display found items */}
      <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.image && (
              <img
                src={item.image}
                alt={item.itemName || 'Found item'}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{item.description}</h3>
              <p className="text-sm text-gray-500 mt-2">Location: {item.location}</p>
              <p className="text-sm text-gray-500">Contact: {item.contactNumber}</p>
              <p className="text-sm text-gray-500">Category: {item.category}</p>
              <p className="text-sm text-gray-500">
                Posted: {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoundItems;