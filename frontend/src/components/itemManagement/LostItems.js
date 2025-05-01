import React, { useEffect, useState } from "react";
import { getLostItems, createLostItem } from "../../api/lostItems";
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../UI/Spinner';
import "../../styles/itemManagementCSS.css";

const LostItems = () => {
  const [items, setItems] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [newItem, setNewItem] = useState({
    itemName: "",
    image: null,
    lostLocation: "",
    contactNumber: user?.phoneNumber || "",
    description: "",
    category: "Unknown",
    userId: user?.id || ""
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

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files?.[0];
      if (file) {
        setNewItem({ ...newItem, image: file });
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setNewItem({ ...newItem, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createLostItem({
        ...newItem,
        userId: user?.id
      });
      fetchItems();
      setNewItem({
        itemName: "",
        image: null,
        lostLocation: "",
        contactNumber: user?.phoneNumber || "",
        description: "",
        category: "Unknown",
        userId: user?.id || ""
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 px-4 py-35">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Report Lost Item</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">Please provide accurate information about the lost item.</p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="itemName" className="block text-sm font-medium leading-6 text-gray-900">
                  Item Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="itemName"
                    id="itemName"
                    value={newItem.itemName}
                    onChange={handleChange}
                    placeholder="E.g. Black wallet"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="lostLocation" className="block text-sm font-medium leading-6 text-gray-900">
                  Lost Location
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="lostLocation"
                    id="lostLocation"
                    value={newItem.lostLocation}
                    onChange={handleChange}
                    placeholder="E.g. SLIIT UNI, Malabe"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="contactNumber" className="block text-sm font-medium leading-6 text-gray-900">
                  Contact Number
                </label>
                <div className="mt-2">
                  <input
                    type="tel"
                    name="contactNumber"
                    id="contactNumber"
                    value={newItem.contactNumber}
                    onChange={handleChange}
                    placeholder="E.g. 0777788899"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-900">
                  Item Photo
                </label>
                <div className="mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 border-gray-900/25">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto max-w-full object-contain mb-4" />
                  )}
                  <div className="text-center">
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label htmlFor="image-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none hover:text-indigo-500">
                        <span>{imagePreview ? 'Change photo' : 'Upload a photo'}</span>
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    name="description"
                    id="description"
                    value={newItem.description}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="E.g. Black wallet with three cards inside"
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" className="text-sm font-semibold text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Submitting...
                </>
              ) : (
                'Add Item'
              )}
            </button>
          </div>
        </div>
      </form>

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