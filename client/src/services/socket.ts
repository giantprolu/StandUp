import io, { Socket } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { SoundData } from '../types/sound';

// Use your Raspberry Pi's IP address
const SOCKET_SERVER_URL = 'http://192.168.1.27:3000';

// Ajoutez cette fonction globale en dehors du hook
let globalMaxPeakValue = 0;

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [soundData, setSoundData] = useState<SoundData>({ currentDb: 0, maxPeak: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [customMaxPeak, setCustomMaxPeak] = useState<number | null>(null);
  
  // Référence pour suivre si le pic maximal est en cours de réinitialisation
  const maxPeakResetInProgress = useRef(false);

  // État local pour le max peak, indépendant du serveur
  const [localMaxPeak, setLocalMaxPeak] = useState(0);
  
  // Ajouter un flag pour indiquer si on utilise notre propre valeur maximum
  const useLocalMaxPeak = useRef(false);
  
  // État combiné qui utilise soit la valeur du serveur, soit notre valeur locale
  const combinedSoundData = {
    currentDb: soundData.currentDb,
    maxPeak: useLocalMaxPeak.current ? localMaxPeak : soundData.maxPeak
  };

  // Effet pour mettre à jour le max local quand nécessaire
  useEffect(() => {
    // Si on n'utilise pas le max local OU si la valeur du serveur est supérieure, mettre à jour
    if (!useLocalMaxPeak.current || soundData.maxPeak > localMaxPeak) {
      setLocalMaxPeak(soundData.maxPeak);
    }
  }, [soundData.maxPeak, localMaxPeak]);

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
          
          // Utiliser notre propre suivi de la valeur maximale
          if (randomDb > globalMaxPeakValue && customMaxPeak === null) {
            globalMaxPeakValue = randomDb;
          }
          
          const maxToDisplay = customMaxPeak !== null ? customMaxPeak : globalMaxPeakValue;
          
          const newData = {
            currentDb: randomDb,
            maxPeak: maxToDisplay
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
          
          // Utiliser notre propre suivi de la valeur maximale
          if (randomDb > globalMaxPeakValue && customMaxPeak === null) {
            globalMaxPeakValue = randomDb;
          }
          
          const maxToDisplay = customMaxPeak !== null ? customMaxPeak : globalMaxPeakValue;
          
          const newData = {
            currentDb: randomDb,
            maxPeak: maxToDisplay
          };
          console.log('Simulation data:', newData);
          setSoundData(newData);
        }, 1000);
      }
    });

    socketInstance.on('soundData', (data) => {
      console.log('Received sound data:', data);
      
      if (data && typeof data.currentDb === 'number' && typeof data.maxPeak === 'number') {
        // Si l'utilisateur a défini une valeur personnalisée, l'utiliser
        if (customMaxPeak !== null) {
          data = { ...data, maxPeak: customMaxPeak };
        }
        
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
  }, [customMaxPeak]); // Ajouter customMaxPeak comme dépendance

  // Reset max peak function
  const resetMaxPeak = () => {
    // 1. Réinitialiser notre valeur locale immédiatement
    setLocalMaxPeak(0);
    
    // 2. Activer l'utilisation de notre valeur locale au lieu de celle du serveur
    useLocalMaxPeak.current = true;
    
    // 3. Envoyer l'événement de réinitialisation au serveur (optionnel)
    if (socket) {
      socket.emit('resetMaxPeak');
    }
    
    console.log('Max peak reset requested - using local tracking');
    
    // Après réinitialisation, commencer à écouter le prochain son détecté
    const detectNextSound = (currentDb: number) => {
      // Si on détecte un son suffisamment fort, commencer à suivre les nouvelles valeurs
      if (currentDb > 10) { // Seuil arbitraire, à ajuster selon vos besoins
        setLocalMaxPeak(currentDb);
        document.removeEventListener('sound-detected', handleSoundDetection as EventListener);
      }
    };
    
    const handleSoundDetection = (e: CustomEvent) => detectNextSound(e.detail.currentDb);
    
    // Nettoyer les écouteurs précédents
    document.removeEventListener('sound-detected', handleSoundDetection as EventListener);
    
    // Enregistrer l'écouteur d'événement
    document.addEventListener('sound-detected', handleSoundDetection as EventListener);
  };

  // Lorsqu'on reçoit des données de son, émettre un événement personnalisé
  useEffect(() => {
    const event = new CustomEvent('sound-detected', { 
      detail: { currentDb: soundData.currentDb } 
    });
    document.dispatchEvent(event);
  }, [soundData.currentDb]);

  return { soundData: combinedSoundData, isConnected, error, resetMaxPeak, simulationActive, setCustomMaxPeak };
};