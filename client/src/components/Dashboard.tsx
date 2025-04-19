import React from 'react';
import SoundMeter from './SoundMeter';
import ConnectionStatus from './ConnectionStatus';
import { useSocketConnection } from '../services/socket';
import { RotateCcw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { soundData, isConnected, error, resetMaxPeak, simulationActive } = useSocketConnection();

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
          value={soundData.currentDb} 
          label="Niveau dB Actuel" 
        />
        
        <div className="relative">
          <SoundMeter 
            value={soundData.maxPeak} 
            label="Pic Sonore Maximum" 
            showIndicator={false}
          />
          <button 
            onClick={resetMaxPeak}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-blue-500 transition-colors"
            title="Réinitialiser le pic maximum"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Historique des Niveaux</h2>
        <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
          <p className="text-gray-500">Le graphique d'historique sera affiché ici dans une future version</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;