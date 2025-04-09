import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Bar } from "react-chartjs-2";
import "../../chartConfig";
import SimpleDataGrid from "../../components/itemManagement/SimpleDataGrid";
import { getLostItems } from '../../api/lostItems';
import { getFoundItems } from '../../api/foundItems';
import ItemForm from "../../components/itemManagement/ItemForm";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "itemName", headerName: "Item Name", flex: 1 },
  { field: "location", headerName: "Location", flex: 1 },
  { field: "contact", headerName: "Contact", flex: 1 },
  { field: "category", headerName: "Category", flex: 1 },
  { field: "action", headerName: "Actions", flex: 1 }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("lost");
  const [showModal, setShowModal] = useState(false);
  const [lostItemRows, setLostItemRows] = useState([]);
  const [foundItemRows, setFoundItemRows] = useState([]);

  const handleOpenForm = () => setShowModal(true);
  const handleCloseForm = () => setShowModal(false);

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
                onClose={() => {
                  handleCloseForm();
                  fetchItems();
                }}
              />
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;