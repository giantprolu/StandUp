import io, { Socket } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { SoundData } from '../types/sound';

// Use your Raspberry Pi's IP address
const SOCKET_SERVER_URL = 'http://192.168.1.27:3000';

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [soundData, setSoundData] = useState<SoundData>({ currentDb: 0, maxPeak: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const socketInstance = io(SOCKET_SERVER_URL);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
      setSimulationActive(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      setSimulationActive(true);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(`Connection failed: ${err.message}`);
      setIsConnected(false);
      setSimulationActive(true);
    });

    socketInstance.on('soundData', (data) => {
      console.log('Received sound data:', data);
      if (data && typeof data.currentDb === 'number' && typeof data.maxPeak === 'number') {
        setSoundData(data);
      } else {
        console.error('Invalid sound data received:', data);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Reset max peak function
  const resetMaxPeak = () => {
    // Add implementation if needed
  };

  return { soundData, isConnected, error, resetMaxPeak, simulationActive };
};