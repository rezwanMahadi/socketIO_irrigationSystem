'use client';

import { useSocket } from './socketContext';

export default function Home() {
  const { isConnected, ledState, toggleLED, devices, sensorsData } = useSocket();

  // Find if any ESP32 device is connected
  const anyDeviceConnected = devices.some(device => device.connected);
  // Get all connected device IDs
  const connectedDeviceIds = devices
    .filter(device => device.connected)
    .map(device => device.deviceId);

  return (
    <main className='min-h-screen bg-gray-100'>
      <h1 className="text-gray-900 text-4xl font-bold pt-8 mb-8 text-center">Smart Irrigation System</h1>
      <div className="flex flex-col gap-4">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-lg w-full ml-5">

          <div className="mb-8">
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

          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900">Test Connection</span>
            <button
              onClick={toggleLED}
              disabled={!isConnected || !anyDeviceConnected}
              className={`px-6 py-3 rounded-full font-bold text-white transition-colors 
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

        <div className="p-8 bg-white rounded-lg shadow-md max-w-lg w-full ml-5">
          <div className="mb-8">
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
              <span className="ml-2 font-bold text-gray-900">{sensorsData.waterLevel} cm</span>
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
