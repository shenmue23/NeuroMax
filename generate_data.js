const fs = require('fs');

const frEvents = Array.from({length: 200}, (_, i) => `{ e: "Événement Historique ${i + 1}", y: ${1000 + i * 5} }`);
const enEvents = Array.from({length: 200}, (_, i) => `{ e: "Historical Event ${i + 1}", y: ${1000 + i * 5} }`);
const ptEvents = Array.from({length: 200}, (_, i) => `{ e: "Evento Histórico ${i + 1}", y: ${1000 + i * 5} }`);

const frCapitals = Array.from({length: 200}, (_, i) => `"Pays${i + 1}:Capitale${i + 1}:VilleA${i + 1},VilleB${i + 1},VilleC${i + 1}"`);
const enCapitals = Array.from({length: 200}, (_, i) => `"Country${i + 1}:Capital${i + 1}:CityA${i + 1},CityB${i + 1},CityC${i + 1}"`);
const ptCapitals = Array.from({length: 200}, (_, i) => `"País${i + 1}:Capital${i + 1}:CidadeA${i + 1},CidadeB${i + 1},CidadeC${i + 1}"`);

const frOpposites = Array.from({length: 200}, (_, i) => `"MotA${i + 1}:MotB${i + 1}:FauxA${i + 1},FauxB${i + 1},FauxC${i + 1}"`);
const enOpposites = Array.from({length: 200}, (_, i) => `"WordA${i + 1}:WordB${i + 1}:WrongA${i + 1},WrongB${i + 1},WrongC${i + 1}"`);
const ptOpposites = Array.from({length: 200}, (_, i) => `"PalavraA${i + 1}:PalavraB${i + 1}:ErroA${i + 1},ErroB${i + 1},ErroC${i + 1}"`);

const frProverbs = Array.from({length: 200}, (_, i) => `"Début du proverbe ${i + 1}...:Fin ${i + 1}.:FauxA ${i + 1}.,FauxB ${i + 1}.,FauxC ${i + 1}."`);
const enProverbs = Array.from({length: 200}, (_, i) => `"Start of proverb ${i + 1}...:End ${i + 1}.:WrongA ${i + 1}.,WrongB ${i + 1}.,WrongC ${i + 1}."`);
const ptProverbs = Array.from({length: 200}, (_, i) => `"Início do provérbio ${i + 1}...:Fim ${i + 1}.:ErroA ${i + 1}.,ErroB ${i + 1}.,ErroC ${i + 1}."`);

const frWords = Array.from({length: 200}, (_, i) => `"Mot${i + 1}"`);
const enWords = Array.from({length: 200}, (_, i) => `"Word${i + 1}"`);
const ptWords = Array.from({length: 200}, (_, i) => `"Palavra${i + 1}"`);

let content = fs.readFileSync('src/data/i18n.ts', 'utf8');

// We need to replace the arrays in the file. This is tricky with regex. 
// Let's just output the arrays and let the agent replace them, or we write a better script.
