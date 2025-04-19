import React from 'react';
import { Activity } from 'lucide-react';

interface SoundMeterProps {
  value: number;
  label: string;
  maxValue?: number;
  showIndicator?: boolean;
}

const SoundMeter: React.FC<SoundMeterProps> = ({ 
  value, 
  label, 
  maxValue = 120, 
  showIndicator = true 
}) => {
  // Calculate percentage for the meter fill
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  // Determine color based on sound level
  let colorClass = 'bg-green-500';
  if (percentage > 80) {
    colorClass = 'bg-red-500';
  } else if (percentage > 60) {
    colorClass = 'bg-yellow-500';
  } else if (percentage > 40) {
    colorClass = 'bg-blue-500';
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          {label}
        </h3>
        <span className="text-2xl font-bold">{value} dB</span>
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
};

export default SoundMeter;