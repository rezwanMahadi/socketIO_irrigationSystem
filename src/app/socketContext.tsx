'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  ledState: boolean;
  toggleLED: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  ledState: false,
  toggleLED: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ledState, setLedState] = useState(false);

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

    socketInstance.on('ledState', (state: boolean) => {
      setLedState(state);
      console.log('LED state updated:', state);
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
      socket.emit('toggleLED', newState);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, ledState, toggleLED }}>
      {children}
    </SocketContext.Provider>
  );
} 