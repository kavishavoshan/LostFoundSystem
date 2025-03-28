import { useState, useEffect } from "react";
import FoundItems from "../../components/itemManagement/FoundItems";
import LostItems from "../../components/itemManagement/LostItems";
import { Dialog } from "@headlessui/react";
import { Bar } from "react-chartjs-2";
import "../../chartConfig";
import SimpleDataGrid from "../../components/itemManagement/SimpleDataGrid";
import { getLostItems } from '../../api/lostItems';
import { getFoundItems} from '../../api/foundItems';

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "itemName", headerName: "Item Name", flex: 1 },
  { field: "location", headerName: "Lost At", flex: 1 },
  { field: "contact", headerName: "Contact", flex: 1 },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("lost");
  const [showModal, setShowModal] = useState(false);
  const [lostItemRows, setLostItemRows] = useState([]);
  const [foundItemRows, setFoundItemRows] = useState([]);
  const [lostCount, setLostCount] = useState(0);
const [foundCount, setFoundCount] = useState(0);

  const handleOpenForm = () => setShowModal(true);
  const handleCloseForm = () => setShowModal(false);

  useEffect(() => {
    async function fetchItems() {
      const items = await getLostItems();

      setLostCount(lostItemRows.length);

      const formattedRows = items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        location: item.lostLocation,
        contact: item.contactNumber,
      }));
      setLostItemRows(formattedRows);
    }

    fetchItems();
  }, []);

  useEffect(() => {
    async function fetchItems() {
      const items = await getFoundItems();

      setFoundCount(foundItemRows.length);

      const formattedRows = items.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        location: item.foundLocation,
        contact: item.contactNumber,
      }));
      setFoundItemRows(formattedRows);
    }

    fetchItems();
  }, []);


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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-darkBlue">Dashboard</h1>

        {/* Box Container with Tabs & Grid */}
        <div className="bg-white rounded-3xl shadow p-6 space-y-6">

          {/* Add Button */}
          <button
            onClick={handleOpenForm}
            className="bg-primary hover:bg-orange-500 text-white font-medium px-6 py-2 rounded-md"
          >
            Add {activeTab === "lost" ? "Lost" : "Found"} Item
          </button>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("lost")}
              className={`w-1/2 py-3 text-center text-lg font-medium ${activeTab === "lost"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
                }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => setActiveTab("found")}
              className={`w-1/2 py-3 text-center text-lg font-medium ${activeTab === "found"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500"
                }`}
            >
              Found Items
            </button>
          </div>

          {/* Item Grid */}
          <div>
            {activeTab === "lost" ? (
              <SimpleDataGrid title="Lost Items" rows={lostItemRows} columns={columns} />
            ) : (
              <SimpleDataGrid title="Found Items" rows={foundItemRows} columns={columns} />
            )}
          </div>
        </div>

        {/* Bottom Section: Chart */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="bg-white p-4 rounded-lg shadow w-full sm:w-3/4">
            <Bar data={sampleChartData} />
          </div>
        </div>

        {/* Lost Item Dialog */}
        <Dialog open={activeTab === "lost" && showModal} onClose={handleCloseForm} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl rounded bg-white p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold text-darkBlue mb-4">
                Add Lost Item
              </Dialog.Title>
              <LostItems onClose={handleCloseForm} />
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Found Item Dialog */}
        <Dialog open={activeTab === "found" && showModal} onClose={handleCloseForm} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl rounded bg-white p-6 shadow-lg">
              <Dialog.Title className="text-lg font-semibold text-darkBlue mb-4">
                Add Found Item
              </Dialog.Title>
              <FoundItems onClose={handleCloseForm} />
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;