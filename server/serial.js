const { SerialPort } = require('serialport');
// If you're using parsers, you might need:
// const { ReadlineParser } = require('@serialport/parser-readline');
const { parseSoundData } = require('./dataParser');
const { emitData } = require('./socket');
require('dotenv').config();

function initSerial() {
  try {
    const port = new SerialPort({
      path: process.env.SERIAL_PORT,
      baudRate: 9600, // Adjust to match your device's baud rate
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
    return null;
  }
}

module.exports = { initSerial };
