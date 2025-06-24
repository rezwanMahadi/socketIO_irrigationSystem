'use client';

import { useSocket } from './socketContext';
import React from "react";

export default function Home() {
  const { isConnected, ledState, pumpMode, toggleLED, togglePumpMode, devices, sensorsData } = useSocket();  
  // Find if any ESP32 device is connected
  const anyDeviceConnected = devices.some(device => device.connected);
  // Get all connected device IDs
  const connectedDeviceIds = devices
    .filter(device => device.connected)
    .map(device => device.deviceId);


  return (
    <main className='min-h-screen w-full bg-gray-200 flex flex-col items-center justify-center p-4'>
      <h1 className="text-gray-900 text-2xl md:text-3xl lg:text-4xl font-bold pt-4 md:pt-8 mb-4 md:mb-8 text-center">Smart Irrigation System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-7xl mx-auto">

        {/* Device Status */}
        <div className="p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md w-full">
          <h2 className="text-center text-lg md:text-xl text-gray-900 font-bold mb-3">Device Status</h2>
          <div className="mb-6 md:mb-8">  
            <div className="mb-2">
              <span className="font-bold text-gray-900">Server Connection:</span>
              <span className={`ml-2 font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="mb-2">
              <span className="font-bold text-gray-900">Device Status:</span>
              <span className={`ml-2 font-bold ${anyDeviceConnected ? 'text-green-600' : 'text-red-600'}`}>
                {anyDeviceConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {connectedDeviceIds.length > 0 && (
              <div className="mb-4 text-gray-700">
                <span className="font-bold">Connected devices: </span>
                {connectedDeviceIds.join(', ')}
              </div>
            )}

            <div className="">
              <span className="font-bold text-gray-900">LED Status:</span>
              <span className={`ml-2 font-bold ${ledState ? 'text-green-600' : 'text-gray-600'}`}>
                {ledState ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="font-bold text-gray-900">Test Connection</span>
            <button
              onClick={toggleLED}
              disabled={!isConnected || !anyDeviceConnected}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-white transition-colors 
              ${ledState
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
                } 
            ${(!isConnected || !anyDeviceConnected) && 'opacity-50 cursor-not-allowed'}`}
            >
              {ledState ? 'Turn LED OFF' : 'Turn LED ON'}
            </button>
          </div>
        </div>

        {/* Pump Control */}
        <div className="p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md w-full">
          <h2 className="text-center text-lg md:text-xl text-gray-900 font-bold mb-3">Pump Control</h2>
          <div className="flex flex-col gap-4 justify-center items-center">
            <div>
              <span className="font-bold text-gray-900 text-base md:text-lg">{pumpMode ? 'Auto Mode' : 'Manual Mode'} Selected</span>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4 justify-center items-center">
              <span className={`font-bold ${pumpMode ? 'text-gray-900' : 'text-[#86d3ff]'} text-sm md:text-lg`}>Manual Mode</span>
              {/* Render the Switch component only after client-side hydration */}
              <div className="flex justify-center items-center">
                <button
                  onClick={togglePumpMode}
                  disabled={!isConnected || !anyDeviceConnected}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-white transition-colors 
                  ${pumpMode
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                    } 
                  ${(!isConnected || !anyDeviceConnected) && 'opacity-50 cursor-not-allowed'}`}
                >
                  {pumpMode ? 'Auto Mode' : 'Manual Mode'}
                </button>
              </div>
              <span className={`font-bold ${pumpMode ? 'text-green-600' : 'text-gray-900'} text-sm md:text-lg`}>Auto Mode</span>
            </div>
          </div>

          <div className="mt-6 md:mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="mb-2">
              <span className="font-bold text-gray-900">Reservoir 1:</span>
              <span className="ml-2 font-bold text-gray-900">OFF</span>
            </div>
            <div className="mb-2">
              <span className="font-bold text-gray-900">Reservoir 2:</span>
              <span className="ml-2 font-bold text-gray-900">OFF</span>
            </div>
            <div className="mb-2">
              <span className="font-bold text-gray-900">Drainage:</span>
              <span className="ml-2 font-bold text-gray-900">OFF</span>
            </div>
          </div>

        </div>

        {/* Sensors Status */}
        <div className="p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md w-full md:col-span-2 lg:col-span-1">
          <h2 className="text-center text-lg md:text-xl text-gray-900 font-bold mb-3">Sensors Status</h2>
          <div className="mb-6 md:mb-8">
            <div className="mb-2">
              <span className="font-bold text-gray-900">Soil Moisture:</span>
              <span className="ml-2 font-bold text-gray-900">{sensorsData.soilMoisture}%</span>
            </div>
            <div className="mb-2">
              <span className="font-bold text-gray-900">Temperature:</span>
              <span className="ml-2 font-bold text-gray-900">{sensorsData.temperature}°C</span>
            </div>
            <div className="mb-2">
              <span className="font-bold text-gray-900">Water Level:</span>
              <span className="ml-2 font-bold text-gray-900">{sensorsData.waterLevel}%</span>
            </div>
          </div>
        </div>

      </div>
      {/* {devices.length > 0 && (
        <div className="text-gray-900 mt-8 p-6 bg-white rounded-lg shadow-md max-w-lg w-full">
          <h2 className="text-xl font-bold mb-3">Device Information:</h2>
          <div className="space-y-4">
            {devices.map(device => (
              <div key={device.socketId} className="border-b pb-2">
                <p><span className="font-bold">Device ID:</span> {device.deviceId}</p>
                <p><span className="font-bold">Type:</span> {device.deviceType}</p>
                <p><span className="font-bold">Status:</span> 
                  <span className={device.connected ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {device.connected ? ' Online' : ' Offline'}
                  </span>
                </p>
                <p><span className="font-bold">Last Seen:</span> {new Date(device.lastSeen).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-gray-900 mt-12 p-6 bg-white rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-xl font-bold mb-3">How it works:</h2>
        <p className="mb-2">1. The web interface connects to the server via WebSocket.</p>
        <p className="mb-2">2. ESP32 also connects to the same WebSocket server.</p>
        <p className="mb-2">3. When you click the button, it sends a command to toggle the LED.</p>
        <p className="mb-2">4. The ESP32 receives this command and controls the onboard LED.</p>
        <p className="mb-2">5. Any state change is synchronized between all connected clients.</p>
      </div> */}
    </main>
  );
}
