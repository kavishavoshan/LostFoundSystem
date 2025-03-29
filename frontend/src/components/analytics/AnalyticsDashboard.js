import React, { useEffect, useState } from 'react';
import { getReport } from '../../api/analytics';
import Chart from './Chart';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/card';
import { Button } from '../UI/button';
import { format } from 'date-fns';

const AnalyticsDashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const data = await getReport();
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;

    const csvContent = [
      ['Metric', 'Value'],
      ['Total Lost Items', report.totalItems.totalLost],
      ['Total Found Items', report.totalItems.totalFound],
      ['Return Rate', `${report.returnRate.returnRate}%`],
      ['', ''],
      ['Common Lost Items', 'Count'],
      ...report.commonItems.map(item => [item.name, item.count]),
      ['', ''],
      ['Frequent Locations', 'Count'],
      ...report.frequentLocations.map(loc => [loc.location, loc.count]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!report) {
    return <div>Error loading analytics</div>;
  }

  const commonItemsData = {
    labels: report.commonItems.map(item => item.name),
    datasets: [
      {
        label: 'Number of Reports',
        data: report.commonItems.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const locationsData = {
    labels: report.frequentLocations.map(loc => loc.location),
    datasets: [
      {
        label: 'Number of Reports',
        data: report.frequentLocations.map(loc => loc.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const returnRateData = {
    labels: ['Return Rate'],
    datasets: [
      {
        data: [report.returnRate.returnRate, 100 - report.returnRate.returnRate],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button onClick={handleExportCSV}>Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.totalItems.total}</p>
            <p className="text-sm text-gray-500">
              Lost: {report.totalItems.totalLost} | Found: {report.totalItems.totalFound}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Return Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{report.returnRate.returnRate}%</p>
            <p className="text-sm text-gray-500">
              Successfully returned items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {format(new Date(report.generatedAt), 'PPpp')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Chart
          type="bar"
          data={commonItemsData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Most Common Lost Items',
              },
            },
          }}
        />

        <Chart
          type="bar"
          data={locationsData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Frequent Locations',
              },
            },
          }}
        />

        <Chart
          type="pie"
          data={returnRateData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Return Rate Distribution',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 