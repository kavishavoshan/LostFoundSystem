import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  PencilIcon,
  EnvelopeIcon,
  PrinterIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import axios from "axios";
import emailjs from "@emailjs/browser";
import { jsPDF } from "jspdf";
import { Dialog } from "@headlessui/react";
import ItemForm from "../../components/itemManagement/ItemForm";

const API_BASE_URL = "http://localhost:3001";
const DEFAULT_USER_ID = "6813ce3d762a5cfabcedcdd7"; // Hardcoded user ID

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

// API functions
const updateLostItem = async (id, updatedData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/lost-items/${id}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating lost item with ID ${id}:`, error);
    throw new Error(
      error.response?.data?.message || "Failed to update lost item"
    );
  }
};

const updateFoundItem = async (id, updatedData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/found-items/${id}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating found item with ID ${id}:`, error);
    throw new Error(
      error.response?.data?.message || "Failed to update found item"
    );
  }
};

const createLostItem = async (itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/lost-items`, {
      ...itemData,
      userId: DEFAULT_USER_ID, // Use the constant for the user ID
    });
    return response.data;
  } catch (error) {
    console.error("Error adding lost item:", error);
    throw error;
  }
};

const createFoundItem = async (itemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/found-items`, {
      ...itemData,
      userId: DEFAULT_USER_ID, // Always use the hardcoded user ID
    });
    return response.data;
  } catch (error) {
    console.error("Error adding found item:", error);
    throw error;
  }
};

function UserTable() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    location: "",
    category: "",
    contactNumber: "",
  });
  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);

  useEffect(() => {
    emailjs.init("lIwc1XWfTvsLQs0zu");

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users first
        const usersRes = await axios.get(`${API_BASE_URL}/users`);
        const usersMap = {};
        usersRes.data.forEach((user) => {
          usersMap[user._id] = user;
        });
        setUsers(usersMap);

        // Then fetch items
        const [lostItemsRes, foundItemsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/lost-items`),
          axios.get(`${API_BASE_URL}/found-items`),
        ]);

        const combinedItems = [
          ...lostItemsRes.data.map((item) => ({
            ...item,
            status: "lost",
            type: "lost",
          })),
          ...foundItemsRes.data.map((item) => ({
            ...item,
            status: "found",
            type: "found",
          })),
        ];

        setItems(combinedItems);
      } catch (err) {
        setError(err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenLostForm = () => setShowLostModal(true);
  const handleCloseLostForm = () => setShowLostModal(false);
  const handleOpenFoundForm = () => setShowFoundModal(true);
  const handleCloseFoundForm = () => setShowFoundModal(false);

  const getUserInfo = (userId) => {
    const user = users[userId] || {};
    return {
      name: user.name || "Anonymous",
      email: user.email || "",
      mobileNumber: user.mobileNumber || "",
    };
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "lost") return item.type === "lost";
    if (activeTab === "found") return item.type === "found";

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.description.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const endpoint =
          items.find((item) => item._id === id)?.type === "lost"
            ? "lost-items"
            : "found-items";

        await axios.delete(`${API_BASE_URL}/${endpoint}/${id}`);
        setItems(items.filter((item) => item._id !== id));
        Swal.fire("Deleted!", "The item has been deleted.", "success");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete item. Please try again.",
      });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item._id);
    setEditFormData({
      description: item.description,
      location: item.location,
      category: item.category,
      contactNumber: item.contactNumber || "",
    });
  };

  const handleEditSubmit = async (id) => {
    try {
      Swal.fire({
        title: "Updating item...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const itemType = items.find((item) => item._id === id)?.type;
      let response;

      if (itemType === "lost") {
        response = await updateLostItem(id, editFormData);
      } else {
        response = await updateFoundItem(id, editFormData);
      }

      setItems(
        items.map((item) =>
          item._id === id ? { ...item, ...editFormData } : item
        )
      );

      setEditingItem(null);
      Swal.fire(
        "Updated!",
        "The item has been updated successfully.",
        "success"
      );
    } catch (error) {
      console.error("Error updating item:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.message || "Failed to update item. Please try again.",
      });
    }
  };

  const handleAddItem = async (type, formData) => {
    try {
      Swal.fire({
        title: "Adding item...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let response;
      if (type === "lost") {
        response = await createLostItem(formData);
      } else {
        response = await createFoundItem(formData);
      }

      // Refresh the items list
      const fetchData = async () => {
        const [lostItemsRes, foundItemsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/lost-items`),
          axios.get(`${API_BASE_URL}/found-items`),
        ]);

        const combinedItems = [
          ...lostItemsRes.data.map((item) => ({
            ...item,
            status: "lost",
            type: "lost",
          })),
          ...foundItemsRes.data.map((item) => ({
            ...item,
            status: "found",
            type: "found",
          })),
        ];

        setItems(combinedItems);
      };

      await fetchData();

      Swal.fire(
        "Added!",
        `The ${type} item has been added successfully.`,
        "success"
      );

      // Close the appropriate modal
      if (type === "lost") {
        handleCloseLostForm();
      } else {
        handleCloseFoundForm();
      }
    } catch (error) {
      console.error(`Error adding ${type} item:`, error);
      Swal.fire({
        icon: "error",
        title: "Add Failed",
        text: error.message || `Failed to add ${type} item. Please try again.`,
      });
    }
  };
  const generateReport = async (item) => {
    try {
      Swal.fire({
        title: "Generating Report...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const userInfo = getUserInfo(item.userId);

      // Create comprehensive report data
      const reportData = {
        reportId: `REP-${Date.now().toString().slice(-6)}`,
        itemId: item._id,
        itemType: item.type.toUpperCase(),
        category: item.category,
        description: item.description,
        location: item.location,
        dateReported: formatDate(item.createdAt),
        lastUpdated: formatDate(item.updatedAt || item.createdAt),
        status: item.status,
        userInformation: {
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.mobileNumber || item.contactNumber || "Not provided",
        },
        reclaimStatus: item.status === "found" ? "Available" : "Not Reclaimed",
        reclaimDate: item.status === "found" ? "N/A" : "Pending",
        adminNotes: "",
      };

      // Generate HTML for the report preview
      const reportHTML = `
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-4xl mx-auto">
  <!-- Report Header -->
  <div class="border-b border-gray-200 pb-6 mb-6">
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">LOST & FOUND OFFICIAL REPORT</h1>
        <p class="text-blue-600 font-medium mt-1">Item Reclamation Document</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500">Report ID: <span class="font-medium text-gray-700">${
          reportData.reportId
        }</span></p>
        <p class="text-sm text-gray-500">Generated: <span class="font-medium text-gray-700">${formatDate(
          new Date()
        )}</span></p>
      </div>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
    <!-- Item Details Section -->
    <div class="bg-gray-50 p-5 rounded-lg border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
        ITEM DETAILS
      </h2>
      <div class="space-y-3">
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Type:</span>
          <span class="text-gray-800">${reportData.itemType}</span>
        </div>
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Category:</span>
          <span class="text-gray-800">${reportData.category}</span>
        </div>
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Description:</span>
          <span class="text-gray-800">${reportData.description}</span>
        </div>
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Location:</span>
          <span class="text-gray-800">${reportData.location}</span>
        </div>
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Status:</span>
          <span class="font-semibold ${
            item.status === "found" ? "text-green-600" : "text-red-600"
          }">
            ${reportData.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>

    <!-- Timeline Section -->
    <div class="bg-gray-50 p-5 rounded-lg border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        TIMELINE
      </h2>
      <div class="space-y-3">
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Reported:</span>
          <span class="text-gray-800">${reportData.dateReported}</span>
        </div>
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Last Updated:</span>
          <span class="text-gray-800">${reportData.lastUpdated}</span>
        </div>
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Reclaim Status:</span>
          <span class="font-medium ${
            reportData.reclaimStatus === "Available"
              ? "text-blue-600"
              : "text-gray-600"
          }">
            ${reportData.reclaimStatus}
          </span>
        </div>
        ${
          reportData.reclaimStatus !== "Available"
            ? `
        <div class="flex">
          <span class="w-32 text-gray-600 font-medium">Reclaim Date:</span>
          <span class="text-gray-800">${reportData.reclaimDate}</span>
        </div>
        `
            : ""
        }
      </div>
    </div>
  </div>

  <!-- User Information Section -->
  <div class="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-8">
    <h2 class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-blue-200 flex items-center">
      <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
      CLAIMANT INFORMATION
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p class="text-sm text-gray-600 font-medium">FULL NAME</p>
        <p class="text-gray-800">${reportData.userInformation.name}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 font-medium">EMAIL ADDRESS</p>
        <p class="text-gray-800">${
          reportData.userInformation.email || "Not provided"
        }</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 font-medium">PHONE NUMBER</p>
        <p class="text-gray-800">${reportData.userInformation.phone}</p>
      </div>
    </div>
  </div>

  <!-- Additional Notes Section -->
  <div class="bg-gray-50 p-5 rounded-lg border border-gray-200">
    <h2 class="text-lg font-semibold text-gray-700 mb-3 flex items-center">
      <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
      ADMINISTRATIVE NOTES
    </h2>
    <textarea id="reportNotes" class="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" placeholder="Enter official notes regarding this case...">${
      reportData.adminNotes
    }</textarea>
  </div>

  <!-- Footer -->
  <div class="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
    <p>This document is an official record of the Lost & Found Property System</p>
    <p class="mt-1">Document ID: ${
      reportData.reportId
    } • Generated on ${new Date().toLocaleString()}</p>
  </div>
</div>
    `;

      // Show the report with options to print or download
      const {
        value: formValues,
        isConfirmed,
        isDenied,
      } = await Swal.fire({
        title: "Item Report",
        html: reportHTML,
        width: "80%",
        showCancelButton: true,
        confirmButtonText: "Print Report",
        cancelButtonText: "Download as PDF",
        showDenyButton: true,
        denyButtonText: "Download as JSON",
        footer:
          '<p class="text-sm text-gray-500">This is an official report from the Lost & Found System</p>',
        preConfirm: () => {
          return {
            notes: document.getElementById("reportNotes").value,
          };
        },
      });

      // Update report with admin notes if added
      if (formValues) {
        reportData.adminNotes = formValues.notes;
      }

      if (isConfirmed) {
        // Print functionality
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
        <html>
          <head>
            <title>Report ${reportData.reportId}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; }
              .footer { margin-top: 40px; font-size: 0.8em; text-align: center; color: #777; }
              .status-found { color: green; }
              .status-lost { color: red; }
            </style>
          </head>
          <body>
            <h1>Lost & Found Item Report</h1>
            <p><span class="label">Report ID:</span> ${reportData.reportId}</p>
            <p><span class="label">Generated on:</span> ${formatDate(
              new Date()
            )}</p>
            
            <div class="section">
              <h2>Item Details</h2>
              <p><span class="label">Type:</span> ${reportData.itemType}</p>
              <p><span class="label">Category:</span> ${reportData.category}</p>
              <p><span class="label">Description:</span> ${
                reportData.description
              }</p>
              <p><span class="label">Location:</span> ${reportData.location}</p>
              <p><span class="label">Status:</span> <span class="${
                item.status === "found" ? "status-found" : "status-lost"
              }">${reportData.status}</span></p>
            </div>
            
            <div class="section">
              <h2>Timeline</h2>
              <p><span class="label">Date Reported:</span> ${
                reportData.dateReported
              }</p>
              <p><span class="label">Last Updated:</span> ${
                reportData.lastUpdated
              }</p>
              <p><span class="label">Reclaim Status:</span> ${
                reportData.reclaimStatus
              }</p>
              ${
                reportData.reclaimStatus !== "Available"
                  ? `<p><span class="label">Reclaim Date:</span> ${reportData.reclaimDate}</p>`
                  : ""
              }
            </div>
            
            <div class="section">
              <h2>User Information</h2>
              <p><span class="label">Name:</span> ${
                reportData.userInformation.name
              }</p>
              <p><span class="label">Email:</span> ${
                reportData.userInformation.email || "Not provided"
              }</p>
              <p><span class="label">Phone:</span> ${
                reportData.userInformation.phone
              }</p>
            </div>
            
            ${
              reportData.adminNotes
                ? `
            <div class="section">
              <h2>Admin Notes</h2>
              <p>${reportData.adminNotes}</p>
            </div>
            `
                : ""
            }
            
            <div class="footer">
              <p>This is an official report from the Lost & Found System</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } else if (Swal.DismissReason.cancel) {
        // Generate and download PDF
        const doc = new jsPDF();

        // Add report title
        doc.setFontSize(18);
        doc.text("Lost & Found Item Report", 105, 15, { align: "center" });

        // Add report metadata
        doc.setFontSize(12);
        doc.text(`Report ID: ${reportData.reportId}`, 14, 25);
        doc.text(`Generated on: ${formatDate(new Date())}`, 14, 30);

        // Add item details
        doc.setFontSize(14);
        doc.text("Item Details", 14, 40);
        doc.setFontSize(12);
        doc.text(`Type: ${reportData.itemType}`, 14, 50);
        doc.text(`Category: ${reportData.category}`, 14, 55);
        doc.text(`Description: ${reportData.description}`, 14, 60);
        doc.text(`Location: ${reportData.location}`, 14, 65);
        doc.text(`Status: ${reportData.status}`, 14, 70);

        // Add timeline
        doc.setFontSize(14);
        doc.text("Timeline", 14, 80);
        doc.setFontSize(12);
        doc.text(`Date Reported: ${reportData.dateReported}`, 14, 90);
        doc.text(`Last Updated: ${reportData.lastUpdated}`, 14, 95);
        doc.text(`Reclaim Status: ${reportData.reclaimStatus}`, 14, 100);
        if (reportData.reclaimStatus !== "Available") {
          doc.text(`Reclaim Date: ${reportData.reclaimDate}`, 14, 105);
        }

        // Add user information
        doc.setFontSize(14);
        doc.text("User Information", 14, 115);
        doc.setFontSize(12);
        doc.text(`Name: ${reportData.userInformation.name}`, 14, 125);
        doc.text(
          `Email: ${reportData.userInformation.email || "Not provided"}`,
          14,
          130
        );
        doc.text(`Phone: ${reportData.userInformation.phone}`, 14, 135);

        // Add admin notes if available
        if (reportData.adminNotes) {
          doc.setFontSize(14);
          doc.text("Admin Notes", 14, 145);
          doc.setFontSize(12);
          const splitNotes = doc.splitTextToSize(reportData.adminNotes, 180);
          doc.text(splitNotes, 14, 155);
        }

        // Add footer
        doc.setFontSize(10);
        doc.text(
          "This is an official report from the Lost & Found System",
          105,
          285,
          { align: "center" }
        );

        // Save the PDF
        doc.save(`lost_found_report_${reportData.reportId}.pdf`);
      } else if (isDenied) {
        // Download as JSON
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
          dataStr
        )}`;
        const exportFileName = `lost_found_report_${reportData.reportId}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileName);
        linkElement.click();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate report. Please try again.",
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendEmail = async (item) => {
    try {
      const userInfo = getUserInfo(item.userId);

      if (!userInfo.email) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Cannot send email - no email found for this user.",
        });
        return;
      }

      Swal.fire({
        title: "Sending email...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // EmailJS service parameters
      const templateParams = {
        to_email: userInfo.email,
        status: item.status,
        category: item.category,
        location: item.location,
        description: item.description,
        from_name: "Lost & Found Team",
      };

      // Send email using EmailJS
      await emailjs.send(
        "service_6kn06l7", // Your EmailJS Service ID
        "template_your_template_id", // Your EmailJS Template ID
        templateParams,
        "lIwc1XWfTvsLQs0zu" // Your EmailJS User ID
      );

      Swal.fire(
        "Email Sent!",
        `Your message has been sent to ${userInfo.email}.`,
        "success"
      );
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to send email. Please try again.",
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Card Header */}
      <div className="px-6 py-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Lost & Found Items
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Track lost and found items in your community
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenLostForm}
              className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Lost Item
            </button>
            <button
              onClick={handleOpenFoundForm}
              className="bg-[#1E3E62] hover:bg-[#0B1829] text-white font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Found Item
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
              placeholder="Search description, location or category..."
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
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const userInfo = getUserInfo(item.userId);
                return (
                  <tr key={item._id}>
                    <td className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">
                            {item.category.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {userInfo.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {userInfo.email}
                          </p>
                          {editingItem === item._id ? (
                            <input
                              type="text"
                              name="contactNumber"
                              value={editFormData.contactNumber}
                              onChange={handleEditChange}
                              className="w-full p-2 border border-gray-300 rounded-md mt-1"
                              placeholder="Contact number"
                            />
                          ) : (
                            item.contactNumber && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.contactNumber}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div>
                        {editingItem === item._id ? (
                          <>
                            <input
                              type="text"
                              name="location"
                              value={editFormData.location}
                              onChange={handleEditChange}
                              className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                              placeholder="Location"
                              required
                            />
                            <div className="flex items-center">
                              <select
                                name="category"
                                value={editFormData.category}
                                onChange={handleEditChange}
                                className="p-2 mr-2 border border-gray-300 rounded-md"
                                required
                              >
                                <option value="">Select category</option>
                                <option value="wallet">Wallet</option>
                                <option value="phone">Phone</option>
                                <option value="keys">Keys</option>
                                <option value="bag">Bag</option>
                                <option value="other">Other</option>
                              </select>
                              <input
                                type="text"
                                name="description"
                                value={editFormData.description}
                                onChange={handleEditChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Description"
                                required
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-medium text-gray-900">
                              {item.location}
                            </p>
                            <p className="text-lg text-gray-500">
                              {item.category}: {item.description}
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-medium ${
                          item.status === "found"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <p className="text-lg text-gray-900">
                        {formatDate(item.createdAt)}
                      </p>
                    </td>
                    <td className="p-4 border-b border-gray-200">
                      <div className="flex space-x-4">
                        {editingItem === item._id ? (
                          <>
                            <button
                              onClick={() => handleEditSubmit(item._id)}
                              className="text-green-400 hover:text-green-600 transition-colors"
                              title="Save changes"
                              disabled={
                                !editFormData.location ||
                                !editFormData.category ||
                                !editFormData.description
                              }
                            >
                              <PencilIcon className="h-6 w-6" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Cancel"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => generateReport(item)}
                              className="text-green-400 hover:text-green-600 transition-colors"
                              title="Generate report"
                            >
                              <PrinterIcon className="h-6 w-6" />
                            </button>
                            <button
                              onClick={() => handleSendEmail(item)}
                              className="text-blue-400 hover:text-blue-600 transition-colors"
                              title="Send email"
                            >
                              <EnvelopeIcon className="h-6 w-6" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-yellow-400 hover:text-yellow-600 transition-colors"
                              title="Edit item"
                            >
                              <PencilIcon className="h-6 w-6" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                              title="Delete item"
                            >
                              <TrashIcon className="h-6 w-6" />
                            </button>
                          </>
                        )}
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
                  No items found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lost Item Form Dialog */}
      <Dialog
        open={showLostModal}
        onClose={handleCloseLostForm}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold text-[#0B1829] mb-4 text-center border-b pb-2">
              Add Lost Item
            </Dialog.Title>
            <ItemForm
              type="lost"
              onClose={handleCloseLostForm}
              onSubmit={(formData) => handleAddItem("lost", formData)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Found Item Form Dialog */}
      <Dialog
        open={showFoundModal}
        onClose={handleCloseFoundForm}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold text-[#0B1829] mb-4 text-center border-b pb-2">
              Add Found Item
            </Dialog.Title>
            <ItemForm
              type="found"
              onClose={handleCloseFoundForm}
              onSubmit={(formData) => handleAddItem("found", formData)}
            />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default UserTable;
