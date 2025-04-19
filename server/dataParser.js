function parseSoundData(rawLine) {
    try {
      // Exemple de ligne : "dB actuel: 3.31 | Pic max: 3.31"
      const regex = /dB actuel:\s*([\d.]+)\s*\|\s*Pic max:\s*([\d.]+)/;
      const match = rawLine.match(regex);
  
      if (!match) return null;
  
      const current = parseFloat(match[1]) * 10; // on remet en échelle ?
      const peak = parseFloat(match[2]) * 10;
  
      return {
        currentDb: current,
        peakDb: peak,
      };
    } catch (e) {
      console.warn('⚠️ Impossible de parser la ligne:', rawLine);
      return null;
    }
  }
  
  module.exports = {
    parseSoundData,
  };
  