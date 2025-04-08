import { useState, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import {
  PencilIcon,
  UserPlusIcon,
  TrashIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

const TABS = [
  { label: "All", value: "all" },
  { label: "Lost", value: "lost" },
  { label: "Found", value: "found" },
];

const TABLE_HEAD = [
  "Member",
  "Place & Item",
  "Status",
  "Register Date",
  "Action",
];

const DEFAULT_USER = {
  img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-4.jpg",
  name: "kavisha Voshan",
  email: "kavishkavoshan@gmail.com",
  place: "Mount Lavinia",
  item: "Hand Bag",
  online: true,
  date: new Date().toLocaleDateString(),
};

const TABLE_ROWS = [
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg",
    name: "Thinal Dilmith",
    email: "thinaldilmith2002@gmail.com",
    place: "Malabe",
    item: "Bag",
    online: true,
    date: "23/04/25",
  },
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-6.jpg",
    name: "Minuk Weerakon",
    email: "minukweerakon@gmail.com",
    place: "Yakkala",
    item: "Phone",
    online: true,
    date: "23/04/25",
  },
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-1.jpg",
    name: "Kaveesha sooriyaarachchi",
    email: "kaveeshasooriyaarachchi@gmail.com",
    place: "Maradana",
    item: "Laptop",
    online: false,
    date: "19/09/25",
  },
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-4.jpg",
    name: "kavisha Voshan",
    email: "kavishkavoshan@gmail.com",
    place: "Mount Lavinia",
    item: "Hand Bag",
    online: true,
    date: "24/12/24",
  },
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-5.jpg",
    name: "Kumesha Wijesandura",
    email: "kumeshawijesundara@gmail.com",
    place: "Kandy",
    item: "Headset",
    online: false,
    date: "04/10/24",
  },
];

function UserTable() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState(TABLE_ROWS);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef(null);

  const filteredRows = rows.filter((row) => {
    // Filter by tab selection
    if (activeTab === "lost") return !row.online;
    if (activeTab === "found") return row.online;

    // Filter by search term if not empty
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        row.name.toLowerCase().includes(searchLower) ||
        row.place.toLowerCase().includes(searchLower) ||
        row.item.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleDelete = (name) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setRows(rows.filter((row) => row.name !== name));
        Swal.fire("Deleted!", "The record has been deleted.", "success");
      }
    });
  };

  const handleMessage = (name) => {
    setCurrentMessage(`Message to ${name}`);
    setShowMessagePopup(true);
  };

  const sendMessage = () => {
    Swal.fire(
      "Message Sent!",
      `Your message to ${currentMessage.split(" ")[2]} has been sent.`,
      "success"
    );
    setShowMessagePopup(false);
    setCurrentMessage("");
  };

  const handleAddUser = () => {
    setCurrentUser(DEFAULT_USER);
    setIsEditMode(false);
    setShowUserPopup(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsEditMode(true);
    setShowUserPopup(true);
  };

  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentUser({
          ...currentUser,
          img: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode) {
      // Update existing user
      setRows(rows.map(row => 
        row.name === currentUser.name ? currentUser : row
      ));
      Swal.fire("Updated!", "User has been updated.", "success");
    } else {
      // Add new user
      setRows([...rows, {
        ...currentUser,
        date: new Date().toLocaleDateString()
      }]);
      Swal.fire("Added!", "New user has been added.", "success");
    }
    
    setShowUserPopup(false);
  };

  return (
    <div className="h-full w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Message Popup */}
      {showMessagePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">Send Message</h3>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              rows="4"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowMessagePopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Popup */}
      {showUserPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">
              {isEditMode ? "Edit User" : "Add New User"}
            </h3>
            <form onSubmit={handleUserSubmit}>
              <div className="mb-4 flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src={currentUser.img}
                    alt="User"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">Click to change photo</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentUser.name}
                  onChange={handleUserChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={currentUser.email}
                  onChange={handleUserChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place
                </label>
                <input
                  type="text"
                  name="place"
                  value={currentUser.place}
                  onChange={handleUserChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item
                </label>
                <input
                  type="text"
                  name="item"
                  value={currentUser.item}
                  onChange={handleUserChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  name="online"
                  checked={currentUser.online}
                  onChange={handleUserChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  id="status-checkbox"
                />
                <label htmlFor="status-checkbox" className="ml-2 block text-sm text-gray-700">
                  Item Found
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUserPopup(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditMode ? "Update" : "Add"} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="px-6 py-4">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Lost & Found Items
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Track lost and found items in your community
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button 
              onClick={handleAddUser}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <UserPlusIcon className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="w-full md:w-max">
            <div className="flex border border-gray-200 rounded-lg">
              {TABS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`px-4 py-2 text-lg font-medium ${
                    activeTab === value
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="Search member, place or item..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="overflow-x-auto px-0">
        <table className="w-full min-w-max">
          <thead>
            <tr>
              {TABLE_HEAD.map((head, index) => (
                <th
                  key={head}
                  className="border-y border-gray-200 bg-gray-50 p-4 text-left  cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between text-base font-medium text-gray-700 uppercase tracking-wider">
                    {head}
                    {index !== TABLE_HEAD.length - 1 && (
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map(
                ({ img, name, email, place, item, online, date }, index) => {
                  const isLast = index === filteredRows.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-gray-200";

                  return (
                    <tr key={`${name}-${index}`}>
                      <td className={classes}>
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              {name}
                            </p>
                            <p className="text-lg text-gray-500">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {place}
                          </p>
                          <p className="text-lg text-gray-500">{item}</p>
                        </div>
                      </td>
                      <td className={classes}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-medium ${
                            online
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {online ? "Found" : "Lost"}
                        </span>
                      </td>
                      <td className={classes}>
                        <p className="text-lg text-gray-900">{date}</p>
                      </td>
                      <td className={classes}>
                        <div className="flex space-x-4">
                          <button 
                            onClick={() => handleEditUser({
                              img, name, email, place, item, online, date
                            })}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                          >
                            <PencilIcon className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => handleMessage(name)}
                            className="text-green-400 hover:text-green-600 transition-colors"
                          >
                            <ChatBubbleBottomCenterIcon className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() => handleDelete(name)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td
                  colSpan={TABLE_HEAD.length}
                  className="p-8 text-center text-gray-500"
                >
                  No items found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
        <p className="text-sm text-gray-700">
          Showing {filteredRows.length} of {rows.length} items
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Previous
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserTable;