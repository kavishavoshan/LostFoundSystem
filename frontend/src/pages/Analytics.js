import React, { useState, useEffect } from 'react';
import { getReport } from '../api/analytics';
import Chart from '../components/analytics/Chart';
import { format } from 'date-fns';

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

  // Create a dataset for the comparison radar chart
  const comparisonData = {
    labels: ['Lost Items', 'Found Items', 'Return Rate (%)', 'Common Items', 'Locations'],
    datasets: [
      {
        label: 'Current Statistics',
        data: [
          totalLostItems, 
          totalFoundItems, 
          returnRateValue, 
          commonItems.length, 
          frequentLocations.length
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }
    ]
  };

  // Create data for the return rate doughnut chart
  const returnRateData = {
    labels: ['Found', 'Lost'],
    datasets: [
      {
        data: [returnRateValue, 100 - returnRateValue],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 4
      }
    ]
  };

  // Create mock data for items over time (line chart)
  // In a real implementation, this would come from the backend
  const currentDate = new Date();
  const last6Months = Array.from({length: 6}, (_, i) => {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - (5 - i));
    return format(date, 'MMM yyyy');
  });
  
  const mockTimeData = {
    labels: last6Months,
    datasets: [
      {
        label: 'Lost Items',
        data: [12, 19, 15, 17, 14, totalLostItems],
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Found Items',
        data: [8, 12, 9, 11, 10, totalFoundItems],
        borderColor: 'rgba(16, 185, 129, 0.8)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of lost and found items</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export Report (CSV)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Items</h3>
            <span className="p-2 bg-blue-100 text-blue-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-3">
            <span className="inline-flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
              <span>{totalLostItems} Lost</span>
            </span>
            <span className="inline-flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span>{totalFoundItems} Found</span>
            </span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Return Rate</h3>
            <span className="p-2 bg-green-100 text-green-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-bold text-green-600">{returnRateValue}%</div>
          <div className="mt-2 text-sm text-gray-500">
            Success rate of item recovery
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Common Categories</h3>
            <span className="p-2 bg-purple-100 text-purple-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{commonItems.length}</div>
          <div className="mt-2 text-sm text-gray-500">
            {commonItems.length > 0 ? commonItems[0].name : 'No data'} is most common
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Report Generated</h3>
            <span className="p-2 bg-yellow-100 text-yellow-800 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="text-xl font-medium text-gray-700">
            {format(new Date(), 'PPpp')}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Data refreshes daily
          </div>
        </div>
      </div>

      {/* Charts - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Common Lost Items</h3>
          {commonItems.length > 0 ? (
            <Chart
              type="bar"
              data={{
                labels: commonItems.map(item => item.name),
                datasets: [
                  {
                    label: 'Number of Items',
                    data: commonItems.map(item => item.count),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 4
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
        
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Frequent Locations</h3>
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

      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Return Rate Analysis</h3>
          <Chart
            type="doughnut"
            data={returnRateData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      return `${label}: ${value}%`;
                    }
                  }
                }
              },
              cutout: '70%'
            }}
          />
          <div className="text-center mt-4 text-sm text-gray-500">
            {returnRateValue}% of items were successfully recovered
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Items Over Time</h3>
          <Chart
            type="line"
            data={mockTimeData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
              }
            }}
          />
        </div>
      </div>

      {/* Radar Chart */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">System Performance Metrics</h3>
        <div className="max-w-md mx-auto">
          <Chart
            type="radar"
            data={comparisonData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.dataset.label || '';
                      const value = context.raw || 0;
                      return `${label}: ${value}`;
                    }
                  }
                }
              },
              scales: {
                r: {
                  angleLines: {
                    display: true
                  },
                  suggestedMin: 0
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;