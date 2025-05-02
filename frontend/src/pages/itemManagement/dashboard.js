import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Bar } from "react-chartjs-2";
import "../../chartConfig";
import SimpleDataGrid from "../../components/itemManagement/SimpleDataGrid";
import { getLostItems } from '../../api/lostItems';
import { getFoundItems } from '../../api/foundItems';
import ItemForm from "../../components/itemManagement/ItemForm";
import { useAuth } from '../../context/AuthContext';

import { exportToExcel, exportToCSV, exportToPDF } from "../../utils/exportUtils.ts";
import { deleteLostItem } from '../../api/lostItems';
import { deleteFoundItem } from '../../api/foundItems';

import { FiEdit2, FiTrash2 } from "react-icons/fi";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("lost");
  const [showModal, setShowModal] = useState(false);
  const [lostItemRows, setLostItemRows] = useState([]);
  const [foundItemRows, setFoundItemRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const { user } = useAuth();
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "itemName", headerName: "Item Description", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "contact", headerName: "Contact", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-4">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              setItemToEdit(params.row); // You can define and use this if editing is needed
              setShowModal(true);
            }}
          >
            <FiEdit2 size={18} />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => {
              setItemToDelete(params.row);
              setShowDeleteModal(true);
            }}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      )
    }
  ];
  
  const handleOpenForm = () => setShowModal(true);
  const handleCloseForm = () => setShowModal(false);

  const fetchItems = async () => {
    if (!user) return;
  
    const lostItems = await getLostItems(user._id);
    const foundItems = await getFoundItems(); // adjust if this also becomes user-specific
  
    setLostItemRows(lostItems.map((item) => ({
      id: item._id,
      itemName: item.description,
      location: item.location,
      contact: item.contactNumber,
      category: item.category || 'Unknown',
      actions: "edit"
    })));
  
    setFoundItemRows(foundItems.map((item) => ({
      id: item._id,
      itemName: item.description,
      location: item.location,
      contact: item.contactNumber,
      category: item.category || 'Unknown',
      actions: "edit"
    })));
  };  

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);  

  const lostCount = lostItemRows.length;
  const foundCount = foundItemRows.length;

  const chartData = {
    labels: ["Lost", "Found"],
    datasets: [
      {
        label: "Items",
        data: [lostCount, foundCount],
        backgroundColor: ["#FF6B00", "#1E3E62"],
      },
    ],
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
  
    if (activeTab === "lost") {
      await deleteLostItem(itemToDelete.id);
      const updatedRows = lostItemRows.filter(item => item.id !== itemToDelete.id);
      setLostItemRows(updatedRows);
    } else {
      await deleteFoundItem(itemToDelete.id);
      const updatedRows = foundItemRows.filter(item => item.id !== itemToDelete.id);
      setFoundItemRows(updatedRows);
    }
  
    setShowDeleteModal(false);
    setItemToDelete(null);
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 mb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[#0B1829]">Item Management Dashboard</h1>

        <div className="flex flex-col md:flex-row gap-40 justify-center">
          <div className="flex flex-col gap-11 w-full md:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h2 className="text-xl font-semibold text-gray-700">Lost Items</h2>
              <p className="text-3xl font-bold text-[#FF6B00] mt-2">{lostCount}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h2 className="text-xl font-semibold text-gray-700">Found Items</h2>
              <p className="text-3xl font-bold text-[#1E3E62] mt-2">{foundCount}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow w-full md:w-1/3 h-full flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Lost vs Found Chart</h2>
            <Bar data={chartData} className="h-full" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 space-y-6">
          <button
            onClick={handleOpenForm}
            className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-medium px-6 py-2 rounded-md transition-colors"
          >
            Add {activeTab === "lost" ? "Lost" : "Found"} Item
          </button>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("lost")}
              className={`w-1/2 py-3 text-center text-lg font-medium ${
                activeTab === "lost"
                  ? "text-[#FF6B00] border-b-2 border-[#FF6B00]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => setActiveTab("found")}
              className={`w-1/2 py-3 text-center text-lg font-medium ${
                activeTab === "found"
                  ? "text-[#FF6B00] border-b-2 border-[#FF6B00]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Found Items
            </button>
          </div>

          {/* Data Grid */}
          <SimpleDataGrid
            title={`${activeTab === "lost" ? "Lost" : "Found"} Items`}
            rows={activeTab === "lost" ? lostItemRows : foundItemRows}
            columns={columns}
          />
        </div>

        {/* Item Form Dialog */}
        <Dialog open={showModal} onClose={handleCloseForm} className="relative z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <Dialog.Title className="text-xl font-bold text-[#0B1829] mb-4 text-center border-b pb-2">
                Add {activeTab === "lost" ? "Lost" : "Found"} Item
              </Dialog.Title>
              <ItemForm
                type={activeTab}
                item={itemToEdit} // <- new
                onClose={() => {
                  handleCloseForm();
                  setItemToEdit(null);
                  fetchItems();
                }}
              />
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteModal} onClose={cancelDelete} className="relative z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
              <Dialog.Title className="text-xl font-semibold text-red-600 mb-4 text-center border-b pb-2">
                ⚠️ Confirm Delete
              </Dialog.Title>
              <div className="text-center text-gray-700 mb-6">
                Are you sure you want to delete <strong>{itemToDelete?.itemName}</strong>?
                <br />
                This action cannot be undone.
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Export Section */}
        <div className="bg-white rounded-xl p-6 shadow w-full md:w-2/3 mx-auto text-center mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
            📄 Generate {activeTab === "lost" ? "Lost" : "Found"} Item Report
          </h3>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() =>
                exportToExcel(
                  activeTab === "lost" ? lostItemRows : foundItemRows,
                  activeTab === "lost" ? "LostItemsReport" : "FoundItemsReport"
                )
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
            >
              📊 Export to Excel
            </button>
            <button
              onClick={() =>
                exportToCSV(
                  activeTab === "lost" ? lostItemRows : foundItemRows,
                  activeTab === "lost" ? "LostItemsReport" : "FoundItemsReport"
                )
              }
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow"
            >
              📁 Export to CSV
            </button>
            <button
              onClick={() =>
                exportToPDF(
                  activeTab === "lost" ? lostItemRows : foundItemRows,
                  activeTab === "lost" ? "LostItemsReport" : "FoundItemsReport"
                )
              }
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
            >
              🧾 Export to PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;