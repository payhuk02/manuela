import fs from 'fs';
import path from 'path';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const outputFile = path.join(process.cwd(), 'init_database.sql');

if (fs.existsSync(migrationsDir)) {
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); 

  let finalSql = '-- Initialisation de la base de données (Cabinet Manuela DIABATE)\n\n';

  // We want to avoid duplicate policy errors by adding DROP POLICY IF EXISTS before CREATE POLICY
  const policyRegex = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_\.]+)/gi;

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Inject DROP POLICY IF EXISTS before each CREATE POLICY
    content = content.replace(policyRegex, (match, policyName, tableName) => {
      return `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};\n${match}`;
    });

    finalSql += `-- Migration: ${file}\n`;
    finalSql += content;
    finalSql += '\n\n';
  }

  fs.writeFileSync(outputFile, finalSql, 'utf8');
  console.log(`Generated ${outputFile} successfully with DROP POLICY statements.`);
} else {
  console.log('No migrations directory found.');
}
