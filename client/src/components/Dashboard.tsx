import React, { useEffect } from 'react';
import SoundMeter, { SoundMeterRef } from './SoundMeter';
import ConnectionStatus from './ConnectionStatus';
import { useSocketConnection } from '../services/socket';
import { RotateCcw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { soundData, isConnected, error, resetMaxPeak, simulationActive } = useSocketConnection();
  
  // Référence à l'instance du SoundMeter pour le pic max
  const maxMeterRef = React.useRef<SoundMeterRef>(null);

  // Log les valeurs pour débogage
  useEffect(() => {
    console.log('Sound data:', soundData);
  }, [soundData]);

  // Fonction qui appelle la réinitialisation à la fois côté serveur et dans le composant
  const handleResetMaxPeak = () => {
    resetMaxPeak(); // Appel à la fonction du serveur
    if (maxMeterRef.current) {
      maxMeterRef.current.resetLocalMax();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Moniteur de Niveau Sonore</h1>
        <p className="text-gray-600">Visualisation en temps réel des niveaux sonores</p>
      </header>

      <ConnectionStatus 
        isConnected={isConnected} 
        error={error} 
        simulationActive={simulationActive}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SoundMeter 
          value={soundData.currentDb || 0} 
          label="Niveau dB Actuel" 
        />
        
        <div className="relative">
          <SoundMeter 
            ref={maxMeterRef}
            value={soundData.maxPeak || 0} 
            label="Pic Sonore Maximum" 
            showIndicator={false}
            isMaxMeter={true}
          />
          <button 
            onClick={handleResetMaxPeak}
            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-all duration-200 flex items-center"
            title="Réinitialiser le pic maximum"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="ml-1 hidden md:inline-block text-sm">Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Affichage des valeurs brutes pour débogage */}
      <div className="bg-gray-100 p-3 mb-6 rounded text-sm">
        <p>Valeurs brutes pour débogage:</p>
        <p>Niveau actuel: {soundData.currentDb || 0}</p>
        <p>Pic maximum: {soundData.maxPeak || 0}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Historique des Niveaux</h2>
        <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
          <p className="text-gray-500">Le graphique d'historique sera affiché ici dans une future version</p>
        </div>
      </div>
      
      {/* Bouton de réinitialisation global du pic maximum */}
      <div className="mt-6 text-center">
        <button 
          onClick={handleResetMaxPeak}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Réinitialiser le pic sonore maximum
        </button>
      </div>
    </div>
  );
};

export default Dashboard;