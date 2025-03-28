import { useState} from "react";

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

const TABS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Lost",
    value: "lost",  // Changed from "monitored" to match filter logic
  },
  {
    label: "Found",
    value: "found",  // Changed from "unmonitored" to match filter logic
  },
];

const TABLE_HEAD = [
  "Member",
  "Place & Item",
  "Status",
  "Register Date",
  "Action",
];

const TABLE_ROWS = [
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg",
    name: "Thinal Dilmith",
    email: "thinaldilmith2002@gmail.com",
    job: "Malabe",
    org: "Bag",
    online: true,
    date: "23/04/25",
  },
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-6.jpg",
    name: "Minuk Weerakon",
    email: "minukweerakon@gmail.com",
    job: "Yakkala",
    org: "Phone",
    online: true,
    date: "23/04/25",
  },
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-1.jpg",
    name: "Kaveesha sooriyaarachchi",
    email: "kaveeshasooriyaarachchi@gmail.com",
    job: "Maradana",
    org: "Laptop",
    online: false,
    date: "19/09/25",
  },
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-4.jpg",
    name: "kavisha Voshan",
    email: "kavishkavoshan@gmail.com",
    job: "Mount Lavinia",
    org: "Hand Bag",
    online: true,
    date: "24/12/24",
  },
  {
    img: "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-5.jpg",
    name: "Kumesha Wijesandura",
    email: "kumeshawijesundara@gmail.com",
    job: "Kandy",
    org: "Headset",
    online: false,
    date: "04/10/24",
  },
];

function UserTable() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = TABLE_ROWS.filter((row) => {
    // Filter by tab selection
    if (activeTab === "lost") return !row.online;
    if (activeTab === "found") return row.online;
    
    // Filter by search term if not empty
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        row.name.toLowerCase().includes(searchLower) ||
        row.email.toLowerCase().includes(searchLower) ||
        row.job.toLowerCase().includes(searchLower) ||
        row.org.toLowerCase().includes(searchLower) ||
        row.date.includes(searchTerm)
      );
    }
    
    return true;
  });

  return (
    <div className="h-full w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Card Header */}
      <div className="px-6 py-4">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Lost & Found Items</h2>
            <p className="mt-1 text-gray-600">
              Track lost and found items in your community
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
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
                  className={`px-4 py-2 text-sm font-medium ${
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
              placeholder="Search....."
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
                  className="border-y border-gray-200 bg-gray-50 p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-gray-700 uppercase tracking-wider">
                    {head}
                    {index !== TABLE_HEAD.length - 1 && (
                      <ChevronUpDownIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map(
                ({ img, name, email, job, org, online, date }, index) => {
                  const isLast = index === filteredRows.length - 1;
                  const classes = isLast ? "p-4" : "p-4 border-b border-gray-200";

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
                            <p className="text-sm font-medium text-gray-900">
                              {name}
                            </p>
                            <p className="text-sm text-gray-500">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {job}
                          </p>
                          <p className="text-sm text-gray-500">{org}</p>
                        </div>
                      </td>
                      <td className={classes}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            online
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {online ? "Found" : "Lost"}
                        </span>
                      </td>
                      <td className={classes}>
                        <p className="text-sm text-gray-900">{date}</p>
                      </td>
                      <td className={classes}>
                        <div className="flex space-x-4">
                         
                            <button
                              className="text-blue-400 hover:text-blue-600 transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                          
                          
                            <button
                              className="text-green-400 hover:text-green-600 transition-colors"
                            >
                              <ChatBubbleBottomCenterIcon className="h-5 w-5" />
                            </button>
                          
                          
                            <button
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="p-8 text-center text-gray-500">
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
          Showing {filteredRows.length} of {TABLE_ROWS.length} items
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