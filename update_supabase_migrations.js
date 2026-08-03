import fs from 'fs';
import path from 'path';

const directoryToSearch = path.join(process.cwd(), 'supabase', 'migrations');
const outputFile = path.join(process.cwd(), 'init_database.sql');

const replacements = [
  { regex: /sylvestre\-roger\-vangah/g, replacement: 'manuela-diabate' },
  { regex: /roger\-vangah/g, replacement: 'manuela-diabate' },
  { regex: /Roger Vangah/g, replacement: 'Manuela Diabate' },
  { regex: /ROGER VANGAH/g, replacement: 'Manuela DIABATE' },
  { regex: /ROGER Vangah/g, replacement: 'Manuela Diabate' },
  { regex: /Roger VANGAH/g, replacement: 'Manuela DIABATE' },
  { regex: /Maître ROGER/g, replacement: 'Maître MANUELA' },
  { regex: /roger\@vangah\-avocats\.com/g, replacement: 'contact@cabinet-diabate.com' },
  { regex: /vangah\-avocats\.com/g, replacement: 'cabinet-diabate.com' },
  { regex: /vangavo\.lovable\.app/g, replacement: 'cabinet-diabate.com' },
  { regex: /N:VANGAH;Roger;;Maître;/g, replacement: 'N:DIABATE;Manuela;;Maître;' }
];

function replaceInFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const r of replacements) {
      if (r.regex.test(content)) {
        content = content.replace(r.regex, r.replacement);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e.message}`);
  }
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else {
      if (fullPath.endsWith('.sql')) {
        replaceInFile(fullPath);
      }
    }
  });
}

traverseDirectory(directoryToSearch);

if (fs.existsSync(directoryToSearch)) {
  const files = fs.readdirSync(directoryToSearch)
    .filter(file => file.endsWith('.sql'))
    .sort(); 

  let finalSql = '-- Initialisation de la base de données (Cabinet Manuela DIABATE)\n\n';

  for (const file of files) {
    const filePath = path.join(directoryToSearch, file);
    const content = fs.readFileSync(filePath, 'utf8');
    finalSql += `-- Migration: ${file}\n`;
    finalSql += content;
    finalSql += '\n\n';
  }

  fs.writeFileSync(outputFile, finalSql, 'utf8');
  console.log(`Generated ${outputFile} successfully.`);
}

console.log('Done.');
