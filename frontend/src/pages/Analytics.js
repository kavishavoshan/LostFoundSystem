import React, { useState, useEffect } from 'react';
import { getReport } from '../api/analytics';
import Chart from '../components/analytics/Chart';

const Analytics = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const data = await getReport();
      setReportData(data);
    } catch (error) {
      setError('Failed to load report data');
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    const csvContent = [
      ['Report Type', 'Value'],
      ['Total Lost Items', reportData.totalLostItems],
      ['Total Found Items', reportData.totalFoundItems],
      ['Return Rate', `${reportData.returnRate}%`],
      ['', ''],
      ['Common Lost Items', ''],
      ...reportData.commonLostItems.map(item => [item.name, item.count]),
      ['', ''],
      ['Frequent Locations', ''],
      ...reportData.frequentLocations.map(location => [location.name, location.count])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lost_found_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading report data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <button
          onClick={handleExportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Export Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Items</h3>
          <div className="text-3xl font-bold">
            {(reportData?.totalLostItems || 0) + (reportData?.totalFoundItems || 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Return Rate</h3>
          <div className="text-3xl font-bold">{reportData?.returnRate ?? 0}%</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Report Generated</h3>
          <div className="text-xl">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Common Lost Items</h3>
          <Chart
            type="bar"
            data={{
              labels: reportData?.commonLostItems?.map(item => item.name) || [],
              datasets: [
                {
                  label: 'Number of Items',
                  data: reportData?.commonLostItems?.map(item => item.count) || [],
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                }
              ]
            }}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Frequent Locations</h3>
          <Chart
            type="pie"
            data={{
              labels: reportData?.frequentLocations?.map(location => location.name) || [],
              datasets: [
                {
                  data: reportData?.frequentLocations?.map(location => location.count) || [],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(16, 185, 129, 0.5)',
                    'rgba(245, 158, 11, 0.5)',
                    'rgba(239, 68, 68, 0.5)',
                    'rgba(139, 92, 246, 0.5)',
                  ],
                }
              ]
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;