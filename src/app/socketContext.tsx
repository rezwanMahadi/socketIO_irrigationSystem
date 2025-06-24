'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Interface for device information
interface DeviceInfo {
  socketId: string;
  deviceId: string;
  deviceType: string;
  lastSeen: string;
  connected: boolean;
  disconnectedAt?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  ledState: boolean;
  pumpMode: boolean;
  controllingStatus: {
    newLedState: boolean;
    selectedPumpMode: boolean;
  };
  sensorsData: {
    soilMoisture: number;
    temperature: number;
    waterLevel: number;
  };
  devices: DeviceInfo[];
  toggleLED: () => void;
  togglePumpMode: () => void;
  }

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  ledState: false,
  pumpMode: false,
  controllingStatus: {
    newLedState: false,
    selectedPumpMode: false
  },
  sensorsData: {
    soilMoisture: 0,
    temperature: 0,
    waterLevel: 0
  },
  devices: [],
  toggleLED: () => {},
  togglePumpMode: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [controllingStatus, setControllingStatus] = useState({
    newLedState: false,
    selectedPumpMode: false
  });
  const [sensorsData, setSensorsData] = useState({
    soilMoisture: 0,
    temperature: 0,
    waterLevel: 0
  });
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [pumpMode, setPumpMode] = useState(false);
  useEffect(() => {
    // Only connect in the browser environment
    if (typeof window === 'undefined') return;

    // Connect to the Heroku Socket.IO server
    const socketInstance = io('https://irrigation-sys-v2-0a9f2f7f5b6e.herokuapp.com', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Heroku WebSocket server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from Heroku WebSocket server');
    });

    socketInstance.on('ledState', (ledState: boolean) => {
      setLedState(ledState);
      console.log('LED state updated:', ledState);
    });

    socketInstance.on('selectedPumpMode', (pumpMode: boolean) => {
      setPumpMode(pumpMode);
      console.log('Pump mode updated:', pumpMode);
    });

    socketInstance.on('controllingStatus', (newLedState: boolean, selectedPumpMode: boolean) => {
      setControllingStatus({ newLedState, selectedPumpMode });
      console.log('Controlling status updated:', newLedState, selectedPumpMode);
    });

    socketInstance.on('sensorsData_controllingStatus', (soilMoisture: number, temperature: number, waterLevel: number, newLedState: boolean, selectedPumpMode: boolean) => {
      console.log('Sensors data and controlling status updated:', soilMoisture, temperature, waterLevel, newLedState, selectedPumpMode);
      setSensorsData({ soilMoisture, temperature, waterLevel });
      setControllingStatus({ newLedState, selectedPumpMode });
    });
    
    // Handle initial devices list
    socketInstance.on('connectedDevices', (devicesList: DeviceInfo[]) => {
      setDevices(devicesList);
      console.log('Received connected devices:', devicesList);
    });
    
    // Handle device updates (connections/disconnections)
    socketInstance.on('deviceUpdate', (devicesList: DeviceInfo[]) => {
      setDevices(devicesList);
      console.log('Device update received:', devicesList);
    });
    
    // Handle reconnection errors
    socketInstance.on('reconnect_failed', () => {
      console.log('Failed to reconnect to Heroku Socket.IO server');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const toggleLED = () => {
    if (socket) {
      const newState = !ledState;
      console.log('Toggling LED to:', newState);
      socket.emit('toggleLED', newState);
    }
  };

  const togglePumpMode = () => {
    if (socket) {
      const newState = !pumpMode;
      console.log('Toggling pump mode to:', newState);
      socket.emit('togglePumpMode', newState);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, ledState, pumpMode, controllingStatus, sensorsData, devices, toggleLED, togglePumpMode }}>
      {children}
    </SocketContext.Provider>
  );
} 