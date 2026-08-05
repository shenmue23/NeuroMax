const fs = require('fs');
let content = fs.readFileSync('src/data/i18n.ts', 'utf8');

content = content.replace(
  /fr:\s*\{[\s\S]*?data:\s*\{\s*events:\s*\[/,
  (match) => match.replace('events: [', 'yesNo: ["Oui", "Non"],\n      colors: ["ROUGE", "BLEU", "VERT", "JAUNE", "NOIR"],\n      chroni: [')
);

content = content.replace(
  /pt:\s*\{[\s\S]*?data:\s*\{\s*events:\s*\[/,
  (match) => match.replace('events: [', 'yesNo: ["Sim", "Não"],\n      colors: ["VERMELHO", "AZUL", "VERDE", "AMARELO", "PRETO"],\n      chroni: [')
);

fs.writeFileSync('src/data/i18n.ts', content);
console.log("Fixed missing properties.");
