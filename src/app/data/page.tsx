'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SensorData {
  id: number;
  temperature: number;
  soilMoisture: number;
  waterLevel: number;
  deviceId: string | null;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

export default function DataPage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, limit: 20, offset: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      let url = `/api/sensor-data?limit=${pagination.limit}&offset=${pagination.offset}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
      }
      
      const result = await response.json();
      setSensorData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to load sensor data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [pagination.offset, pagination.limit, startDate, endDate]);
  
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset pagination offset when applying new filters
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchData();
  };
  
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  const goToPage = (newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };
  
  return (
    <main className="min-h-screen w-full bg-gray-200 flex flex-col items-center p-4">
      <h1 className="text-gray-900 text-2xl md:text-3xl lg:text-4xl font-bold pt-4 md:pt-8 mb-4 text-center">
        Sensor Data History
      </h1>
      
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>
        
        {/* Filter Form */}
        <form onSubmit={handleFilterSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
          
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPagination(prev => ({ ...prev, offset: 0 }));
                setTimeout(fetchData, 0);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </form>
        
        {/* Data Table */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        ) : sensorData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No sensor data available.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Temperature (°C)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Soil Moisture (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Water Level (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sensorData.map((reading) => (
                    <tr key={reading.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(reading.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reading.temperature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reading.soilMoisture}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reading.waterLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reading.deviceId || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.offset + sensorData.length, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => goToPage(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0}
                  className={`px-3 py-1 border rounded ${
                    pagination.offset === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <button
                  onClick={() =>
                    goToPage(pagination.offset + pagination.limit)
                  }
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className={`px-3 py-1 border rounded ${
                    pagination.offset + pagination.limit >= pagination.total
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
