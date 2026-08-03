import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, regex, replacement) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

const avocatLink = 'https://consultation.avocat.fr/avocat-paris/manuela-diabate-48544.html';
const oldLinkRegex = /https:\/\/calendly\.com\/manuela-diabate-avocats/g;

replaceInFile(path.join('src', 'components', 'admin', 'BusinessCardAdmin.tsx'), oldLinkRegex, avocatLink);
replaceInFile(path.join('src', 'components', 'admin', 'ContactAdmin.tsx'), oldLinkRegex, avocatLink);
replaceInFile(path.join('src', 'pages', 'Carte.tsx'), oldLinkRegex, avocatLink);
// Update any other calendly references if any
replaceInFile(path.join('src', 'components', 'admin', 'ContactAdmin.tsx'), /https:\/\/calendly\.com\/\.\.\./g, 'https://consultation.avocat.fr/avocat-paris/...');

console.log("Appointment links updated.");
