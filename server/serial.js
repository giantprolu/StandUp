const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const { parseSoundData } = require('./dataParser');
const { emitData } = require('./socket');
require('dotenv').config();

function initSerial() {
  const port = new SerialPort(process.env.SERIAL_PORT, {
    baudRate: parseInt(process.env.BAUD_RATE, 10),
  });

  const parser = port.pipe(new Readline({ delimiter: '\n' }));

  parser.on('data', (line) => {
    const cleaned = line.trim();
    const parsed = parseSoundData(cleaned);
    if (parsed) {
      console.log(`[Arduino] ${JSON.stringify(parsed)}`);
      emitData('soundData', parsed);
    }
  });

  port.on('error', (err) => {
    console.error('❌ Erreur série :', err.message);
  });
}

module.exports = {
  initSerial,
};
