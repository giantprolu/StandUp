import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  simulationActive: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  error, 
  simulationActive 
}) => {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 mr-2" />
            <span>Connecté au serveur</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 mr-2" />
            <span>
              {simulationActive 
                ? 'Mode simulation actif (données générées aléatoirement)' 
                : 'Déconnecté du serveur'}
            </span>
          </>
        )}
      </div>
      
      {error && (
        <div className="ml-4 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;