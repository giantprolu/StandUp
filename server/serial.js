const { SerialPort } = require('serialport');
// If you're using parsers, you might need:
// const { ReadlineParser } = require('@serialport/parser-readline');
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

    port.on('open', () => {
      console.log('Serial port opened successfully');
    });

    port.on('data', (data) => {
      console.log('Data received:', data.toString());
      const cleaned = data.toString().trim();
      const parsed = parseSoundData(cleaned);
      if (parsed) {
        console.log(`[Arduino] ${JSON.stringify(parsed)}`);
        emitData('soundData', parsed);
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
