import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { SoundData } from '../types/sound';

// This should be your backend server URL where the WebSocket is hosted
const SOCKET_SERVER_URL = 'http://localhost:3000';

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [soundData, setSoundData] = useState<SoundData>({ currentDb: 0, maxPeak: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demo purposes, we'll simulate data if not connected to a real server
  const [simulationActive, setSimulationActive] = useState(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    try {
      const socketInstance = io(SOCKET_SERVER_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log('Connected to WebSocket server');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from WebSocket server');
        
        // Enable simulation mode when disconnected
        if (!simulationActive) {
          setSimulationActive(true);
        }
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setError(`Connection error: ${err.message}`);
        
        // Enable simulation mode on connection error
        if (!simulationActive) {
          setSimulationActive(true);
        }
      });

      socketInstance.on('soundData', (data: SoundData) => {
        setSoundData(data);
      });

      return () => {
        socketInstance.disconnect();
      };
    } catch (err) {
      console.error('Error initializing socket:', err);
      setError('Failed to initialize socket connection');
      
      // Enable simulation mode on initialization error
      if (!simulationActive) {
        setSimulationActive(true);
      }
    }
  }, []);

  // Data simulation for demo purposes
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      const newDb = Math.floor(Math.random() * 60) + 40; // Random dB between 40-100
      setSoundData(prevData => {
        const newMaxPeak = Math.max(prevData.maxPeak, newDb);
        return { currentDb: newDb, maxPeak: newMaxPeak };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulationActive]);

  const resetMaxPeak = () => {
    setSoundData(prev => ({ ...prev, maxPeak: prev.currentDb }));
    
    // If connected to a real server, send reset command
    if (socket && isConnected) {
      socket.emit('resetMaxPeak');
    }
  };

  return { soundData, isConnected, error, resetMaxPeak, simulationActive };
};