function parseSoundData(rawLine) {
  try {
    console.log('Parsing line:', rawLine);
    
    // Exemple de ligne : "dB actuel: 3.31 | Pic max: 3.31"
    const regex = /dB actuel:\s*([\d.]+)\s*\|\s*Pic max:\s*([\d.]+)/i;
    const match = rawLine.match(regex);
  
    if (!match) {
      console.log('⚠️ No match found in:', rawLine);
      return null;
    }

    // Convert string values to numbers and scale them
    const current = parseFloat(match[1]) * 10; 
    const peak = parseFloat(match[2]) * 10;
  
    // Ensure we have valid numbers
    if (isNaN(current) || isNaN(peak)) {
      console.log('⚠️ Invalid number values:', current, peak);
      return null;
    }

    console.log('✅ Parsed values:', current, peak);
    
    return {
      currentDb: current,
      maxPeak: peak,
    };
  } catch (e) {
    console.warn('⚠️ Error parsing line:', rawLine, e);
    return null;
  }
}

module.exports = {
  parseSoundData,
};
