import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { Activity, RotateCcw } from 'lucide-react';

interface SoundMeterProps {
  value: number;
  label: string;
  maxValue?: number;
  showIndicator?: boolean;
  isMaxMeter?: boolean;
  onReset?: () => void;
  showResetButton?: boolean;
}

export interface SoundMeterRef {
  resetLocalMax: () => void;
}

// Simplifiez le composant pour ne plus gérer la logique de max peak

const SoundMeter = forwardRef<SoundMeterRef, SoundMeterProps>(({ 
  value, 
  label, 
  maxValue = 120, 
  showIndicator = true,
  isMaxMeter = false,
  onReset,
  showResetButton = false
}, ref) => {
  
  // Format the value to have max 2 decimal places
  const formattedValue = Number(value.toFixed(2));
  
  // Calculate percentage for the meter fill
  const percentage = Math.min(Math.max((formattedValue / maxValue) * 100, 0), 100);
  
  // Determine color based on sound level
  let colorClass = 'bg-green-500';
  if (percentage > 80) {
    colorClass = 'bg-red-500';
  } else if (percentage > 60) {
    colorClass = 'bg-yellow-500';
  } else if (percentage > 40) {
    colorClass = 'bg-blue-500';
  }

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    resetLocalMax: () => {
      // Ne rien faire ici - la logique est maintenant dans le service socket
    }
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          {label}
        </h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold mr-2">{formattedValue} dB</span>
          {showResetButton && isMaxMeter && (
            <button 
              onClick={onReset}
              className="p-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-all duration-200"
              title="Réinitialiser le pic maximum"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
        <div 
          className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showIndicator && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100+</span>
        </div>
      )}
    </div>
  );
});

SoundMeter.displayName = 'SoundMeter';

export default SoundMeter;