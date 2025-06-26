'use client';

import { useSocket } from './socketContext';
import React from "react";
import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function Home() {
  const {
    isConnected,
    ledState,
    pumpMode,
    reservoir1,
    reservoir2,
    soilMoistureUpperLimitIs,
    soilMoistureLowerLimitIs,
    waterLevelLimitIs,
    toggleLED,
    togglePumpMode,
    toggleReservoir1,
    toggleReservoir2,
    handleSoilMoistureUpperLimitChange,
    handleSoilMoistureLowerLimitChange,
    handleWaterLevelLimitChange,
    handleSetLimitSubmit,
    devices,
    sensorsData,
    soilMoistureUpperLimit,
    soilMoistureLowerLimit,
    waterLevelLimit
  } = useSocket();
  // Find if any ESP32 device is connected
  const anyDeviceConnected = devices.some(device => device.connected);
  // Get all connected device IDs
  const connectedDeviceIds = devices
    .filter(device => device.connected)
    .map(device => device.deviceId);

  return (
    <main className='min-h-screen w-full bg-gradient-to-b from-blue-50 to-green-50 flex flex-col items-center justify-start p-4 md:p-6'>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-gray-800 text-3xl md:text-4xl lg:text-5xl font-bold mt-6 mb-2 text-center">
            Smart Irrigation System
          </h1>
          <div className="h-1 w-24 bg-green-500 mb-8 rounded-full"></div>
          
          <Link 
            href="/data" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Sensor Data History
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Connection Status Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
            <div className="bg-blue-600 p-4">
              <h2 className="text-white text-xl font-bold text-center">Device Status</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Server Connection:</span>
                  <div className={`flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="font-bold">{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Device Status:</span>
                  <div className={`flex items-center ${anyDeviceConnected ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`h-3 w-3 rounded-full mr-2 ${anyDeviceConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    <span className="font-bold">{anyDeviceConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>

                {connectedDeviceIds.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-700 mb-1">Connected Devices:</span>
                      <div className="flex flex-wrap gap-2">
                        {connectedDeviceIds.map((id) => (
                          <span key={id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pump Control Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
            <div className="bg-green-600 p-4">
              <h2 className="text-white text-xl font-bold text-center">Pump Control</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col mb-4 sm:mb-0 text-center sm:text-left">
                    <span className={`font-semibold ${pumpMode ? 'text-gray-400' : 'text-green-600'}`}>Manual Mode</span>
                    <span className={`font-semibold ${pumpMode ? 'text-green-600' : 'text-gray-400'}`}>Auto Mode</span>
                  </div>
                  <button
                    onClick={togglePumpMode}
                    disabled={!isConnected || !anyDeviceConnected}
                    className={`px-6 py-3 rounded-lg font-medium text-white transition-colors shadow-md
                      ${pumpMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}
                      ${(!isConnected || !anyDeviceConnected) && 'opacity-50 cursor-not-allowed'}`}
                  >
                    {pumpMode ? 'Switch to Manual' : 'Switch to Auto'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-50 p-3 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Reservoir 1</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${reservoir1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {reservoir1 ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex justify-center">
                      <button
                        onClick={toggleReservoir1}
                        disabled={!isConnected || !anyDeviceConnected || pumpMode === true}
                        className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-colors
                          ${reservoir1 ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                          ${(!isConnected || !anyDeviceConnected || pumpMode === true) && 'opacity-50 cursor-not-allowed'}`}
                      >
                        {reservoir1 ? 'Turn OFF' : 'Turn ON'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-50 p-3 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Reservoir 2</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${reservoir2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {reservoir2 ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex justify-center">
                      <button
                        onClick={toggleReservoir2}
                        disabled={!isConnected || !anyDeviceConnected || pumpMode === true}
                        className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-colors
                          ${reservoir2 ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                          ${(!isConnected || !anyDeviceConnected || pumpMode === true) && 'opacity-50 cursor-not-allowed'}`}
                      >
                        {reservoir2 ? 'Turn OFF' : 'Turn ON'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensors Status Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
            <div className="bg-yellow-600 p-4">
              <h2 className="text-white text-xl font-bold text-center">Sensors Status</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 h-24 rounded-full border-8 border-blue-200 flex items-center justify-center mb-3">
                    <span className="text-xl font-bold text-blue-700">{sensorsData.soilMoisture}%</span>
                  </div>
                  <span className="font-medium text-gray-700">Soil Moisture</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 h-24 rounded-full border-8 border-red-200 flex items-center justify-center mb-3">
                    <span className="text-xl font-bold text-red-700">{sensorsData.temperature}°C</span>
                  </div>
                  <span className="font-medium text-gray-700">Temperature</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 h-24 rounded-full border-8 border-green-200 flex items-center justify-center mb-3">
                    <span className="text-xl font-bold text-green-700">{sensorsData.waterLevel}%</span>
                  </div>
                  <span className="font-medium text-gray-700">Water Level</span>
                </div>
              </div>
            </div>
          </div>

          {/* Set Limit Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
            <div className="bg-purple-600 p-4">
              <h2 className="text-white text-xl font-bold text-center">Set Limits</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-gray-700">Soil Moisture Upper:</span>
                    <span className="font-bold text-purple-700">{soilMoistureUpperLimitIs}%</span>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-gray-700">Soil Moisture Lower:</span>
                    <span className="font-bold text-purple-700">{soilMoistureLowerLimitIs}%</span>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-gray-700">Water Level Limit:</span>
                    <span className="font-bold text-purple-700">{waterLevelLimitIs}%</span>
                  </div>
                </div>

                <form onSubmit={handleSetLimitSubmit} method='POST' className="flex flex-col space-y-4">
                  <div className="relative">
                    <input
                      onChange={handleSoilMoistureUpperLimitChange}
                      disabled={!isConnected || !anyDeviceConnected || pumpMode === true}
                      value={soilMoistureUpperLimit || ''}
                      placeholder="Upper Soil Moisture Limit"
                      type="number"
                      className={`w-full p-3 pl-10 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all
                        ${(!isConnected || !anyDeviceConnected || pumpMode === true) && 'opacity-50 cursor-not-allowed'}`}
                    />
                    <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                  
                  <div className="relative">
                    <input
                      onChange={handleSoilMoistureLowerLimitChange}
                      disabled={!isConnected || !anyDeviceConnected || pumpMode === true}
                      value={soilMoistureLowerLimit || ''}
                      placeholder="Lower Soil Moisture Limit"
                      type="number"
                      className={`w-full p-3 pl-10 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all
                        ${(!isConnected || !anyDeviceConnected || pumpMode === true) && 'opacity-50 cursor-not-allowed'}`}
                    />
                    <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <div className="relative">
                    <input
                      onChange={handleWaterLevelLimitChange}
                      disabled={!isConnected || !anyDeviceConnected || pumpMode === true}
                      value={waterLevelLimit || ''}
                      placeholder="Water Level Limit"
                      type="number"
                      className={`w-full p-3 pl-10 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all
                        ${(!isConnected || !anyDeviceConnected || pumpMode === true) && 'opacity-50 cursor-not-allowed'}`}
                    />
                    <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!isConnected || !anyDeviceConnected || pumpMode === true}
                    className={`w-full px-6 py-3 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md
                      ${(!isConnected || !anyDeviceConnected || pumpMode === true) && 'opacity-50 cursor-not-allowed'}`}
                  >
                    Save Limits
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
