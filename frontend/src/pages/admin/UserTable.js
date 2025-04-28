import { useState, useEffect, useRef } from "react";
import axios from 'axios';
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

const TABLE_HEAD = [
  "User",
  "Email",
  "Register Date",
  "Action",
];

function UserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:3001/users/getUsers');
        if (response.data && response.data.status === 'success') {
          setUsers(response.data.data);
        } else {
          setError('Failed to fetch users: Invalid response format');
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(`Failed to fetch users: ${err.message}`);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
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
        setUsers(users.filter((user) => user.name !== name));
        Swal.fire("Deleted!", "The user has been removed (locally).", "success");
      }
    });
  };

  return (
    <div className="h-full w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="px-6 py-4">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Registered Users
            </h2>
            <p className="mt-2 text-base text-gray-600">
              View all registered users in the system
            </p>
          </div>
        </div>

        <div className="relative flex w-full gap-2 md:w-max">
          <div className="relative h-10 w-full min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-transparent py-2 pl-11 pr-4 text-gray-900 outline-none focus:border-blue-500"
              placeholder="Search users..."
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto px-0">
        <table className="w-full min-w-max">
          <thead>
            <tr>
              {TABLE_HEAD.map((head, index) => (
                <th
                  key={head}
                  className="border-y border-gray-200 bg-gray-50 p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors"
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
            {loading ? (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={TABLE_HEAD.length} className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => {
                const isLast = index === filteredUsers.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-gray-200";

                return (
                  <tr key={user.id || index}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {user.name || 'N/A'}
                          </p>
                          <p className="text-lg text-gray-500">{user.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className={classes}>
                      <p className="text-lg text-gray-900">
                        {user.registerDate || 'N/A'}
                      </p>
                    </td>
                    <td className={classes}>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleDelete(user.name)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={TABLE_HEAD.length}
                  className="p-8 text-center text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;