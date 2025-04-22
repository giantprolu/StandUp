import io, { Socket } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { SoundData } from '../types/sound';

// Use your Raspberry Pi's IP address
const SOCKET_SERVER_URL = 'http://10.0.3.37:3000';

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rawSoundData, setRawSoundData] = useState<SoundData>({ currentDb: 0, maxPeak: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  
  // Gestion complètement locale du pic maximum
  const [localMaxPeak, setLocalMaxPeak] = useState(0);
  const resetRequested = useRef(false);
  
  // Mise à jour du pic maximum local
  useEffect(() => {
    const currentLevel = rawSoundData.currentDb;
    
    // Si une réinitialisation a été demandée, on ignore la valeur actuelle
    if (resetRequested.current) {
      console.log('Reset requested, ignoring current value');
      return;
    }
    
    // Sinon on met à jour le maximum local si nécessaire
    if (currentLevel > localMaxPeak) {
      console.log(`Updating local max from ${localMaxPeak} to ${currentLevel}`);
      setLocalMaxPeak(currentLevel);
    }
  }, [rawSoundData.currentDb, localMaxPeak]);
  
  // Données exposées à l'extérieur
  const soundData = {
    currentDb: rawSoundData.currentDb,
    maxPeak: localMaxPeak
  };

  useEffect(() => {
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
          setRawSoundData({ currentDb: randomDb, maxPeak: 0 }); // On ignore maxPeak du serveur
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
          setRawSoundData({ currentDb: randomDb, maxPeak: 0 }); // On ignore maxPeak du serveur
        }, 1000);
      }
    });

    socketInstance.on('soundData', (data) => {
      console.log('Received sound data:', data);
      if (data && typeof data.currentDb === 'number') {
        // On enregistre les données brutes, mais on ignore maxPeak du serveur
        setRawSoundData({ currentDb: data.currentDb, maxPeak: 0 });
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

  // Reset max peak function - maintenant complètement locale
  const resetMaxPeak = () => {
    console.log('Max peak reset requested');
    
    // 1. Marquer qu'une réinitialisation a été demandée
    resetRequested.current = true;
    
    // 2. Réinitialiser la valeur max locale
    setLocalMaxPeak(0);
    
    // 3. Après un court délai, permettre de commencer à enregistrer de nouvelles valeurs max
    setTimeout(() => {
      resetRequested.current = false;
      console.log('Ready to track new max values');
    }, 500); // 500ms devrait être suffisant
    
    // 4. Facultatif: notifier le serveur (si nécessaire)
    if (socket) {
      socket.emit('resetMaxPeak');
    }
  };

  return { soundData, isConnected, error, resetMaxPeak, simulationActive };
};