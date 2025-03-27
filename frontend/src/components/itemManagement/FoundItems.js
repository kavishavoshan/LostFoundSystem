import React, { useEffect, useState } from "react";
import { getLostItems, createLostItem } from "../../api/lostItems";
import { Input } from "../UI/input";
import { Button } from "../UI/button";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import "../../styles/itemManagementCSS.css";

const FoundItems = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    itemName: "",
    imageUrl: "",
    lostLocation: "",
    contactNumber: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const data = await getLostItems();
    setItems(data);
  };

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLostItem(newItem);
      fetchItems();
      setNewItem({ itemName: "", imageUrl: "", lostLocation: "", contactNumber: "" });
    } catch (error) {
      console.error("Failed to add item");
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 px-4 py-30">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Report Found Item</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">Please provide accurate information about the Found Item.</p>

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
                    type="text"
                    name="contactNumber"
                    id="contactNumber"
                    value={newItem.contactNumber}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-900">
                  Item Photo
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="imageUrl"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none hover:text-indigo-500"
                      >
                        <span>Upload an image</span>
                        <input
                          id="imageUrl"
                          name="imageUrl"
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
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" className="text-sm font-semibold text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add Item
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FoundItems;