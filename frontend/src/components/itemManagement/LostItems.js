import React, { useEffect, useState } from "react";
import { getLostItems } from "../../api/lostItems";
import { useAuth } from '../../context/AuthContext';
import ItemForm from './ItemForm';
import "../../styles/itemManagementCSS.css";

const LostItems = () => {
  const [items, setItems] = useState([]);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: "",
    image: null,
    lostLocation: "",
    contactNumber: user?.phoneNumber || "",
    description: "",
    category: "Unknown",
    userId: user?._id || ""
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await getLostItems();
      setItems(data);
    } catch (error) {
      console.error("Error fetching lost items:", error);
    }
  };

  const handleFormClose = () => {
    if (!user?._id) {
      alert('Please log in to report a lost item');
      return;
    }
    setShowForm(false);
    fetchItems();
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 px-4 py-35">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Lost Items</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md"
        >
          Report Lost Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Report Lost Item</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <ItemForm type="lost" onClose={handleFormClose} />
          </div>
        </div>
      )}

      {/* Display lost items */}
      <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.image && (
              <img
                src={item.image}
                alt={item.itemName || 'Lost item'}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{item.itemName}</h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
              <p className="text-sm text-gray-500 mt-2">Location: {item.lostLocation}</p>
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

export default LostItems;