import io, { Socket } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { SoundData } from '../types/sound';

// Use your Raspberry Pi's IP address
const SOCKET_SERVER_URL = 'http://192.168.1.27:3000';

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [soundData, setSoundData] = useState<SoundData>({ currentDb: 0, maxPeak: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  
  // Référence pour suivre si le pic maximal est en cours de réinitialisation
  const maxPeakResetInProgress = useRef(false);

  useEffect(() => {
    // Connect to WebSocket
    const socketInstance = io(SOCKET_SERVER_URL);
    setSocket(socketInstance);

    // Simulation timer pour générer des données en mode déconnecté
    let simulationTimer: NodeJS.Timeout | null = null;

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
      setSimulationActive(false);
      
      // Arrêter la simulation quand connecté
      if (simulationTimer) {
        clearInterval(simulationTimer);
        simulationTimer = null;
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      setSimulationActive(true);
      
      // Démarrer la simulation quand déconnecté
      if (!simulationTimer) {
        simulationTimer = setInterval(() => {
          const randomDb = Math.random() * 80;
          const newData = {
            currentDb: randomDb,
            maxPeak: Math.max(soundData.maxPeak, randomDb)
          };
          console.log('Simulation data:', newData);
          setSoundData(newData);
        }, 1000);
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(`Connection failed: ${err.message}`);
      setIsConnected(false);
      setSimulationActive(true);
      
      // Démarrer la simulation en cas d'erreur
      if (!simulationTimer) {
        simulationTimer = setInterval(() => {
          const randomDb = Math.random() * 80;
          const newData = {
            currentDb: randomDb,
            maxPeak: Math.max(soundData.maxPeak, randomDb)
          };
          console.log('Simulation data:', newData);
          setSoundData(newData);
        }, 1000);
      }
    });

    socketInstance.on('soundData', (data) => {
      console.log('Received sound data:', data);
      
      // Si une réinitialisation est en cours, remplacer la valeur maxPeak par zéro
      if (maxPeakResetInProgress.current) {
        console.log('Overriding maxPeak due to reset in progress');
        data.maxPeak = 0;
      }
      
      if (data && typeof data.currentDb === 'number' && typeof data.maxPeak === 'number') {
        setSoundData(data);
      } else {
        console.error('Invalid sound data received:', data);
      }
    });

    return () => {
      socketInstance.disconnect();
      if (simulationTimer) {
        clearInterval(simulationTimer);
      }
    };
  }, []);

  // Reset max peak function
  const resetMaxPeak = () => {
    if (socket) {
      // Envoyer un événement au serveur pour réinitialiser le pic
      socket.emit('resetMaxPeak');
      
      // Mettre à jour l'état local immédiatement pour éviter que le composant ne reçoive l'ancienne valeur
      setSoundData(prev => ({ ...prev, maxPeak: 0 }));
      
      console.log('Max peak reset requested');
    } else {
      console.warn('Cannot reset max peak: socket not connected');
      // En mode simulation, réinitialiser localement
      if (simulationActive) {
        setSoundData(prev => ({ ...prev, maxPeak: 0 }));
      }
    }
  };

  return { soundData, isConnected, error, resetMaxPeak, simulationActive };
};