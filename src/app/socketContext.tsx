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

    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    socketInstance.on('ledState', (state: boolean) => {
      setLedState(state);
      console.log('LED state updated:', state);
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