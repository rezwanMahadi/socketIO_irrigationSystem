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
  reservoir1: boolean;
  reservoir2: boolean;
  sensorsData: {
    soilMoisture: number;
    temperature: number;
    waterLevel: number;
  };
  devices: DeviceInfo[];
  toggleLED: () => void;
  togglePumpMode: () => void;
  toggleReservoir1: () => void;
  toggleReservoir2: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  ledState: false,
  pumpMode: false,
  reservoir1: false,
  reservoir2: false,
  sensorsData: {
    soilMoisture: 0,
    temperature: 0,
    waterLevel: 0
  },
  devices: [],
  toggleLED: () => { },
  togglePumpMode: () => { },
  toggleReservoir1: () => { },
  toggleReservoir2: () => { },
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [reservoir1, setReservoir1] = useState(false);
  const [reservoir2, setReservoir2] = useState(false);
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

    socketInstance.on('reservoir1State', (reservoir1: boolean) => {
      setReservoir1(reservoir1);
      console.log('Reservoir 1 state updated:', reservoir1);
    });

    socketInstance.on('reservoir2State', (reservoir2: boolean) => {
      setReservoir2(reservoir2);
      console.log('Reservoir 2 state updated:', reservoir2);
    });

    // socketInstance.on('controllingStatus', (newLedState: boolean, selectedPumpMode: boolean) => {
    //   setControllingStatus({ newLedState, selectedPumpMode });
    //   console.log('Controlling status updated:', newLedState, selectedPumpMode);
    // });

    socketInstance.on('sensorsData_controllingStatus', (soilMoisture: number, temperature: number, waterLevel: number, newLedState: boolean, selectedPumpMode: boolean) => {
      console.log('Sensors data and controlling status updated:', soilMoisture, temperature, waterLevel, newLedState, selectedPumpMode);
      setSensorsData({ soilMoisture, temperature, waterLevel });
      // setControllingStatus({ newLedState, selectedPumpMode });
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

  const toggleReservoir1 = () => {
    if (socket) {
      const newState = !reservoir1;
      console.log('Toggling reservoir 1 to:', newState);
      socket.emit('toggleReservoir1', newState);
    }
  };

  const toggleReservoir2 = () => {
    if (socket) {
      const newState = !reservoir2;
      console.log('Toggling reservoir 2 to:', newState);
      socket.emit('toggleReservoir2', newState);
    }
  };

  return (
    <SocketContext.Provider value={
      {
        socket,
        isConnected,
        ledState,
        pumpMode,
        reservoir1,
        reservoir2,
        sensorsData,
        devices,
        toggleLED,
        togglePumpMode,
        toggleReservoir1,
        toggleReservoir2
      }
    }>
      {children}
    </SocketContext.Provider>
  );
} 