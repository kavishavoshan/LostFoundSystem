import React, { useEffect, useState } from "react";
import { getLostItems, createLostItem } from "../../api/lostItems";
import { Input } from "../UI/input";
import { Button } from "../UI/button";
import { Card, CardContent, CardHeader, CardTitle } from "../UI/card";
import "../../styles/itemManagementCSS.css";

const LostItems = () => {
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
    <div className="lost-items-container">
      <Card className="lost-item-form-card">
        <CardHeader>
          <CardTitle>Report Lost Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="lost-item-form">
            <Input type="text" name="itemName" placeholder="Item Name" value={newItem.itemName} onChange={handleChange} required className="input-field" />
            <Input type="text" name="imageUrl" placeholder="Image URL" value={newItem.imageUrl} onChange={handleChange} required className="input-field" />
            <Input type="text" name="lostLocation" placeholder="Lost Location" value={newItem.lostLocation} onChange={handleChange} required className="input-field" />
            <Input type="text" name="contactNumber" placeholder="Contact Number" value={newItem.contactNumber} onChange={handleChange} required className="input-field" />
            <Button type="submit" className="submit-button">Add Item</Button>
          </form>
        </CardContent>
      </Card>

      <div className="lost-items-list">
        {items.map((item) => (
          <Card key={item.id} className="lost-item-card">
            <CardContent>
              <img src={item.imageUrl} alt={item.itemName} className="lost-item-image" />
              <p className="lost-item-name">{item.itemName}</p>
              <p className="lost-item-location">Lost at: {item.lostLocation}</p>
              <p className="lost-item-contact">Contact: {item.contactNumber}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LostItems;