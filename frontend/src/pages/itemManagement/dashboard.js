import { useState, useEffect } from "react";
<<<<<<< HEAD
import FoundItems from "../../components/itemManagement/FoundItems";
import LostItems from "../../components/itemManagement/LostItems";
=======
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
import { Dialog } from "@headlessui/react";
import { Bar } from "react-chartjs-2";
import "../../chartConfig";
import SimpleDataGrid from "../../components/itemManagement/SimpleDataGrid";
<<<<<<< HEAD
import { getLostItems, deleteLostItem } from '../../api/lostItems';
import { getFoundItems, deleteFoundItem } from '../../api/foundItems';
import { exportToExcel, exportToCSV, exportToPDF } from "../../utils/exportUtils.ts";
=======
import { getLostItems } from '../../api/lostItems';
import { getFoundItems } from '../../api/foundItems';
import ItemForm from "../../components/itemManagement/ItemForm";


import { exportToExcel, exportToCSV, exportToPDF } from "../../utils/exportUtils.ts";
import { deleteLostItem } from '../../api/lostItems';
import { deleteFoundItem } from '../../api/foundItems';

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "itemName", headerName: "Item Name", flex: 1 },
  { field: "location", headerName: "Location", flex: 1 },
  { field: "contact", headerName: "Contact", flex: 1 },
  { field: "category", headerName: "Category", flex: 1 },
  { field: "action", headerName: "Actions", flex: 1 }
];
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("lost");
  const [showModal, setShowModal] = useState(false);
  const [lostItemRows, setLostItemRows] = useState([]);
  const [foundItemRows, setFoundItemRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleOpenForm = () => setShowModal(true);
  const handleCloseForm = () => setShowModal(false);

<<<<<<< HEAD
  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
=======
  const fetchItems = async () => {
    const lostItems = await getLostItems();
    const foundItems = await getFoundItems();

    setLostItemRows(lostItems.map((item) => ({
      id: item._id,
      itemName: item.itemName,
      location: item.lostLocation,
      contact: item.contactNumber,
      category: item.category || 'Unknown',
      actions: "edit"
    })));

    setFoundItemRows(foundItems.map((item) => ({
      id: item._id,
      itemName: item.itemName,
      location: item.foundLocation,
      contact: item.contactNumber,
      category: item.category || 'Unknown',
      actions: "edit"
    })));
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
<<<<<<< HEAD

=======
  
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
    if (activeTab === "lost") {
      await deleteLostItem(itemToDelete.id);
      const updatedRows = lostItemRows.filter(item => item.id !== itemToDelete.id);
      setLostItemRows(updatedRows);
    } else {
      await deleteFoundItem(itemToDelete.id);
      const updatedRows = foundItemRows.filter(item => item.id !== itemToDelete.id);
      setFoundItemRows(updatedRows);
    }
<<<<<<< HEAD

    setShowDeleteModal(false);
    setItemToDelete(null);
  };

=======
  
    setShowDeleteModal(false);
    setItemToDelete(null);
  };
  
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

<<<<<<< HEAD
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "itemName", headerName: "Item Name", flex: 1 },
    { field: "location", headerName: "Lost At", flex: 1 },
    { field: "contact", headerName: "Contact", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(params.row)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(params.row)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            🗑️ Delete
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (item) => {
    setActiveTab(item.location ? "lost" : "found");
    setShowModal(true);
    // Optionally: setEditingItem(item);
  };

  useEffect(() => {
    async function fetchLostItems() {
      const items = await getLostItems();
      const formattedRows = items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        location: item.lostLocation,
        contact: item.contactNumber,
      }));
      setLostItemRows(formattedRows);
    }

    async function fetchFoundItems() {
      const items = await getFoundItems();
      const formattedRows = items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        location: item.foundLocation,
        contact: item.contactNumber,
      }));
      setFoundItemRows(formattedRows);
    }

    fetchLostItems();
    fetchFoundItems();
  }, []);

  const lostCount = lostItemRows.length;
  const foundCount = foundItemRows.length;

  const sampleChartData = {
    labels: ["Lost", "Found"],
    datasets: [
      {
        label: "Items",
        data: [lostCount, foundCount],
        backgroundColor: ["#FF6500", "#1E3E62"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 mb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-darkBlue">Item Management Dashboard</h1>
=======
  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 mb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[#0B1829]">Item Management Dashboard</h1>
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad

        <div className="flex flex-col md:flex-row gap-40 justify-center">
          <div className="flex flex-col gap-11 w-full md:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h2 className="text-xl font-semibold text-gray-700">Lost Items</h2>
<<<<<<< HEAD
              <p className="text-3xl font-bold text-orange-500 mt-2">{lostCount}</p>
=======
              <p className="text-3xl font-bold text-[#FF6B00] mt-2">{lostCount}</p>
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
            </div>

            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h2 className="text-xl font-semibold text-gray-700">Found Items</h2>
<<<<<<< HEAD
              <p className="text-3xl font-bold text-blue-800 mt-2">{foundCount}</p>
=======
              <p className="text-3xl font-bold text-[#1E3E62] mt-2">{foundCount}</p>
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow w-full md:w-1/3 h-full flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Lost vs Found Chart</h2>
<<<<<<< HEAD
            <Bar data={sampleChartData} className="h-full" />
=======
            <Bar data={chartData} className="h-full" />
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 space-y-6">
          <button
            onClick={handleOpenForm}
<<<<<<< HEAD
            className="bg-primary hover:bg-orange-500 text-white font-medium px-6 py-2 rounded-md"
=======
            className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-medium px-6 py-2 rounded-md transition-colors"
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
          >
            Add {activeTab === "lost" ? "Lost" : "Found"} Item
          </button>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("lost")}
<<<<<<< HEAD
              className={`w-1/2 py-3 text-center text-lg font-medium ${activeTab === "lost"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
                }`}
=======
              className={`w-1/2 py-3 text-center text-lg font-medium ${
                activeTab === "lost"
                  ? "text-[#FF6B00] border-b-2 border-[#FF6B00]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
            >
              Lost Items
            </button>
            <button
              onClick={() => setActiveTab("found")}
<<<<<<< HEAD
              className={`w-1/2 py-3 text-center text-lg font-medium ${activeTab === "found"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
                }`}
=======
              className={`w-1/2 py-3 text-center text-lg font-medium ${
                activeTab === "found"
                  ? "text-[#FF6B00] border-b-2 border-[#FF6B00]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
            >
              Found Items
            </button>
          </div>

<<<<<<< HEAD
          {activeTab === "lost" ? (
            <SimpleDataGrid title="Lost Items" rows={lostItemRows} columns={columns} />
          ) : (
            <SimpleDataGrid title="Found Items" rows={foundItemRows} columns={columns} />
          )}
        </div>

        {/* Lost Item Dialog */}
        <Dialog open={activeTab === "lost" && showModal} onClose={handleCloseForm} className="relative z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-300">
              <Dialog.Title className="text-xl font-bold text-darkBlue mb-4 text-center border-b pb-2">
                Add Lost Item
              </Dialog.Title>
              <div className="space-y-4">
                <LostItems onClose={handleCloseForm} />
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Found Item Dialog */}
        <Dialog open={activeTab === "found" && showModal} onClose={handleCloseForm} className="relative z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-300">
              <Dialog.Title className="text-xl font-bold text-darkBlue mb-4 text-center border-b pb-2">
                Add Found Item
              </Dialog.Title>
              <div className="space-y-4">
                <FoundItems onClose={handleCloseForm} />
              </div>
=======
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
                onClose={() => {
                  handleCloseForm();
                  fetchItems();
                }}
              />
>>>>>>> ec05ea273e228e3408f97b83d31a87c3c3c072ad
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