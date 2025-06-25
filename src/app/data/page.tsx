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
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col items-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-gray-800 text-2xl md:text-3xl lg:text-4xl font-bold pt-4 md:pt-8 mb-4 md:mb-6 text-center">
          Sensor Data History
        </h1>
      
        <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" 
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
          </div>
          
          {/* Filter Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Filter Data</h2>
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div className="flex items-end sm:justify-start lg:justify-center">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 w-full sm:w-auto"
                >
                  Apply Filters
                </button>
              </div>
              
              <div className="flex items-end sm:justify-start lg:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setPagination(prev => ({ ...prev, offset: 0 }));
                    setTimeout(fetchData, 0);
                  }}
                  className="px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 transition-all duration-200 w-full sm:w-auto"
                >
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
          
          {/* Data Table */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          ) : sensorData.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="mt-4 text-gray-600">No sensor data available for the selected period.</p>
            </div>
          ) : (
            <>
              {/* Mobile card view - only visible on small screens */}
              <div className="md:hidden space-y-4">
                {sensorData.map((reading) => (
                  <div key={reading.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="mb-2 pb-2 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-500">Time</span>
                      <p className="text-gray-800">{formatDateTime(reading.createdAt)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-semibold text-gray-500">Temperature</span>
                        <p className="text-gray-800">{reading.temperature}°C</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-semibold text-gray-500">Soil Moisture</span>
                        <p className="text-gray-800">{reading.soilMoisture}%</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-semibold text-gray-500">Water Level</span>
                        <p className="text-gray-800">{reading.waterLevel}%</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-semibold text-gray-500">Device ID</span>
                        <p className="text-gray-800">{reading.deviceId || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop table view - hidden on small screens */}
              <div className="hidden md:block overflow-x-auto">
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
                      <tr key={reading.id} className="hover:bg-gray-50 transition-colors duration-150">
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
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-700 text-center sm:text-left">
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
                    className={`px-4 py-2 border rounded-md ${
                      pagination.offset === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={() =>
                      goToPage(pagination.offset + pagination.limit)
                    }
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className={`px-4 py-2 border rounded-md ${
                      pagination.offset + pagination.limit >= pagination.total
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-150'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
