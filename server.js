const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

// Store the current LED state and pump mode
let ledState = false;
let pumpMode = false;

// Store the current sensors data
let sensorsData = {
  soilMoisture: 0,
  temperature: 0,
  waterLevel: 0
};

// Store connected devices
let connectedDevices = [];

// Function to save sensor data to the database
async function saveSensorData(data, deviceId) {
  try {
    await prisma.sensorData.create({
      data: {
        temperature: data.temperature,
        soilMoisture: data.soilMoisture,
        waterLevel: data.waterLevel,
        deviceId: deviceId || 'unknown'
      }
    });
    console.log('Sensor data saved to database');
  } catch (error) {
    console.error('Error saving sensor data:', error);
  }
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    // Special handling for Socket.IO API route to mimic Vercel's behavior
    if (req.url?.startsWith('/api/socketio')) {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end('Socket.IO OK (Dev Server)');
      return;
    }
    
    return handle(req, res);
  });
  
  const io = new Server(server, {
    path: '/socket.io/',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current LED state to newly connected client
    socket.emit('ledState', ledState);
    socket.emit('selectedPumpMode', pumpMode);
    
    // Listen for device registration (ESP32 devices)
    socket.on('registerDevice', (deviceInfo) => {
      const { deviceId, deviceType } = deviceInfo;
      console.log(`Device registered: ${deviceId} (${deviceType})`);
      
      // Add the device to our list of connected devices
      const device = {
        socketId: socket.id,
        deviceId,
        deviceType,
        lastSeen: new Date().toISOString(),
        connected: true
      };
      
      // Remove any existing entry for this device
      connectedDevices = connectedDevices.filter(d => d.deviceId !== deviceId);
      connectedDevices.push(device);
      
      // Broadcast updated device list to all clients
      io.emit('connectedDevices', connectedDevices);
    });
    
    // Handle LED toggle from web client
    socket.on('toggleLED', (state) => {
      console.log('LED state toggled to:', state);
      ledState = state;
      // Broadcast the new state to all connected clients (including ESP32)
      io.emit('ledState', ledState);
    });

    // Handle pump mode toggle
    socket.on('togglePumpMode', (state) => {
      console.log('Pump mode toggled to:', state);
      pumpMode = state;
      // Broadcast the new state to all connected clients
      io.emit('selectedPumpMode', pumpMode);
    });

    // Handle sensor data from ESP32
    socket.on('sensorsData', (soilMoisture, temperature, waterLevel, deviceId) => {
      console.log('Received sensor data:', { soilMoisture, temperature, waterLevel, deviceId });
      
      // Update stored sensor data
      sensorsData = { soilMoisture, temperature, waterLevel };
      
      // Broadcast to all clients
      io.emit('sensorsData_controllingStatus', soilMoisture, temperature, waterLevel, ledState, pumpMode);
      
      // Save data to database with device ID
      saveSensorData(sensorsData, deviceId);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Check if the disconnected client was a registered device
      const deviceIndex = connectedDevices.findIndex(d => d.socketId === socket.id);
      if (deviceIndex >= 0) {
        // Mark the device as disconnected but keep it in the list
        connectedDevices[deviceIndex].connected = false;
        connectedDevices[deviceIndex].disconnectedAt = new Date().toISOString();
        
        // Broadcast updated device list
        io.emit('deviceUpdate', connectedDevices);
      }
    });
  });
  
  server.listen(PORT, () => {
    console.log(`> Server listening on http://localhost:${PORT}`);
    console.log(`> Dev mode: ${dev ? 'enabled' : 'disabled'}`);
  });
}); 