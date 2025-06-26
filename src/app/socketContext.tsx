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
  soilMoistureUpperLimitIs: number;
  soilMoistureLowerLimitIs: number;
  waterLevelLimitIs: number;
  soilMoistureUpperLimit: number;
  soilMoistureLowerLimit: number;
  waterLevelLimit: number;
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
  handleSoilMoistureUpperLimitChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSoilMoistureLowerLimitChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleWaterLevelLimitChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSetLimitSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  ledState: false,
  pumpMode: false,
  reservoir1: false,
  reservoir2: false,
  soilMoistureUpperLimitIs: 0,
  soilMoistureLowerLimitIs: 0,
  waterLevelLimitIs: 0,
  soilMoistureUpperLimit: 0,
  soilMoistureLowerLimit: 0,
  waterLevelLimit: 0,
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
  handleSoilMoistureUpperLimitChange: () => { },
  handleSoilMoistureLowerLimitChange: () => { },
  handleWaterLevelLimitChange: () => { },
  handleSetLimitSubmit: () => { },
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [reservoir1, setReservoir1] = useState(false);
  const [reservoir2, setReservoir2] = useState(false);
  const [soilMoistureUpperLimitIs, setSoilMoistureUpperLimitIs] = useState(0);
  const [soilMoistureLowerLimitIs, setSoilMoistureLowerLimitIs] = useState(0);
  const [waterLevelLimitIs, setWaterLevelLimitIs] = useState(0);
  const [sensorsData, setSensorsData] = useState({
    soilMoisture: 0,
    temperature: 0,
    waterLevel: 0
  });
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [pumpMode, setPumpMode] = useState(false);
  const [soilMoistureUpperLimit, setSoilMoistureUpperLimit] = useState(0);
  const [soilMoistureLowerLimit, setSoilMoistureLowerLimit] = useState(0);
  const [waterLevelLimit, setWaterLevelLimit] = useState(0);

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

    socketInstance.on('sensorsData_controllingStatus', (soilMoisture: number, temperature: number, waterLevel: number, newLedState: boolean, selectedPumpMode: boolean) => {
      console.log('Sensors data and controlling status updated:', soilMoisture, temperature, waterLevel, newLedState, selectedPumpMode);
      setSensorsData({ soilMoisture, temperature, waterLevel });
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

  useEffect(() => {
    const fetchLimit = async () => {
      const response = await fetch('/api/limits?limitId=11');
      const data = await response.json();
      console.log(data);
      setSoilMoistureUpperLimitIs(data.soilMoistureUpperLimit);
      setSoilMoistureLowerLimitIs(data.soilMoistureLowerLimit);
      setWaterLevelLimitIs(data.waterLevelLimit);
    };

    fetchLimit();

    const interval = setInterval(fetchLimit, 2000);

    // Cleanup
    return () => clearInterval(interval);
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

  const handleSoilMoistureUpperLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoilMoistureUpperLimit(Number(e.target.value));
  };

  const handleSoilMoistureLowerLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoilMoistureLowerLimit(Number(e.target.value));
  };

  const handleWaterLevelLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWaterLevelLimit(Number(e.target.value));
  };

  const handleSetLimitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Setting limit:', soilMoistureUpperLimit, soilMoistureLowerLimit, waterLevelLimit);
    if (socket) {
      socket.emit('setNewLimit', soilMoistureUpperLimit, soilMoistureLowerLimit, waterLevelLimit);
    }
    setSoilMoistureUpperLimit(0);
    setSoilMoistureLowerLimit(0);
    setWaterLevelLimit(0);
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
        soilMoistureUpperLimitIs,
        soilMoistureLowerLimitIs,
        waterLevelLimitIs,
        soilMoistureUpperLimit,
        soilMoistureLowerLimit,
        waterLevelLimit,
        sensorsData,
        devices,
        toggleLED,
        togglePumpMode,
        toggleReservoir1,
        toggleReservoir2,
        handleSoilMoistureUpperLimitChange,
        handleSoilMoistureLowerLimitChange,
        handleWaterLevelLimitChange,
        handleSetLimitSubmit
      }
    }>
      {children}
    </SocketContext.Provider>
  );
} 