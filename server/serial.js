const { SerialPort } = require('serialport');
const { parseSoundData } = require('./dataParser');
const { emitData } = require('./socket');
require('dotenv').config();

function initSerial() {
  try {
    // Check if we're in a development environment without hardware
    if (process.env.NODE_ENV === 'development' && !process.env.SERIAL_PORT) {
      console.log('⚠️ Running in development mode without serial device');
      return null;
    }

    const port = new SerialPort({
      path: process.env.SERIAL_PORT || '/dev/ttyACM0',
      baudRate: parseInt(process.env.BAUD_RATE) || 9600,
    });

    // Add a buffer to collect partial data
    let dataBuffer = '';

    port.on('open', () => {
      console.log('Serial port opened successfully');
    });

    port.on('data', (data) => {
      // Convert to string and add to buffer
      const chunk = data.toString();
      dataBuffer += chunk;
      
      console.log('Data received:', chunk);
      
      // Check if we have a complete line (ending with newline)
      if (dataBuffer.includes('\n')) {
        // Split by newline in case we got multiple lines
        const lines = dataBuffer.split('\n');
        
        // Process all complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          console.log('Processing complete line:', line);
          
          const parsed = parseSoundData(line);
          if (parsed) {
            console.log(`[Arduino] ${JSON.stringify(parsed)}`);
            emitData('soundData', parsed);
          }
        }
        
        // Keep the last incomplete line in the buffer
        dataBuffer = lines[lines.length - 1];
      }
    });

    port.on('error', (err) => {
      console.error('Serial port error:', err);
    });

    return port;
  } catch (error) {
    console.error('Failed to initialize serial port:', error);
    console.log('⚠️ Continuing without serial connection');
    return null;
  }
}

module.exports = { initSerial };
