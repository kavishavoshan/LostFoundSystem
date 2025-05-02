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
      console.log('Received analytics data:', data);
      if (!data) {
        throw new Error('No data received from the server');
      }
      setReportData(data);
    } catch (error) {
      setError('Failed to load report data: ' + (error.message || 'Unknown error'));
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    // Extract data from the nested structure
    const totalLostItems = reportData.totalItems?.totalLost || 0;
    const totalFoundItems = reportData.totalItems?.totalFound || 0;
    const returnRateValue = reportData.returnRate?.returnRate || 0;
    const commonItems = reportData.commonItems || [];
    const frequentLocations = reportData.frequentLocations || [];

    const csvContent = [
      ['Report Type', 'Value'],
      ['Total Lost Items', totalLostItems],
      ['Total Found Items', totalFoundItems],
      ['Return Rate', `${returnRateValue}%`],
      ['', ''],
      ['Common Lost Items', ''],
      ...commonItems.map(item => [item.name, item.count]),
      ['', ''],
      ['Frequent Locations', ''],
      ...frequentLocations.map(location => [location.location || location.name, location.count])
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mr-3"></div>
        <div className="text-xl">Loading report data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchReport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Extract data from the nested structure
  const totalLostItems = reportData?.totalItems?.totalLost || 0;
  const totalFoundItems = reportData?.totalItems?.totalFound || 0;
  const totalItems = reportData?.totalItems?.total || (totalLostItems + totalFoundItems);
  const returnRateValue = reportData?.returnRate?.returnRate || 0;
  const commonItems = reportData?.commonItems || [];
  const frequentLocations = reportData?.frequentLocations || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <button
          onClick={handleExportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Export Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Total Items</h3>
          <div className="text-3xl font-bold text-blue-600">
            {totalItems}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <span className="inline-block mr-3">
              <span className="font-medium text-red-500">{totalLostItems}</span> Lost
            </span>
            <span className="inline-block">
              <span className="font-medium text-green-500">{totalFoundItems}</span> Found
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Return Rate</h3>
          <div className="text-3xl font-bold text-green-600">{returnRateValue}%</div>
          <div className="mt-2 text-sm text-gray-500">
            Percentage of items that were found
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Report Generated</h3>
          <div className="text-xl text-gray-700">
            {new Date().toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-4">Common Lost Items</h3>
          {commonItems.length > 0 ? (
            <Chart
              type="bar"
              data={{
                labels: commonItems.map(item => item.name),
                datasets: [
                  {
                    label: 'Number of Items',
                    data: commonItems.map(item => item.count),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-4">Frequent Locations</h3>
          {frequentLocations.length > 0 ? (
            <Chart
              type="pie"
              data={{
                labels: frequentLocations.map(location => location.location || location.name),
                datasets: [
                  {
                    data: frequentLocations.map(location => location.count),
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.7)',
                      'rgba(16, 185, 129, 0.7)',
                      'rgba(245, 158, 11, 0.7)',
                      'rgba(239, 68, 68, 0.7)',
                      'rgba(139, 92, 246, 0.7)',
                    ],
                    borderColor: [
                      'rgba(59, 130, 246, 1)',
                      'rgba(16, 185, 129, 1)',
                      'rgba(245, 158, 11, 1)',
                      'rgba(239, 68, 68, 1)',
                      'rgba(139, 92, 246, 1)',
                    ],
                    borderWidth: 1,
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;