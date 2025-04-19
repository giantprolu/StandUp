import React from 'react';
import Dashboard from './components/Dashboard';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io();
function App() {
  const [soundData, setSoundData] = useState('');

  useEffect(() => {
    socket.on('soundData', (data: string) => {
      setSoundData(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Dashboard />
    </div>
  );
}

export default App;