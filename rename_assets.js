import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'src', 'assets');

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);

  for (const file of files) {
    const oldPath = path.join(assetsDir, file);
    let newName = file;

    newName = newName.replace(/roger-vangah/g, 'manuela-diabate');
    newName = newName.replace(/rv-avocat/g, 'md-avocat');
    newName = newName.replace(/maitre-vangah/g, 'maitre-diabate');
    newName = newName.replace(/cabinet-vangah/g, 'cabinet-diabate');
    newName = newName.replace(/rv-avocat-emblem/g, 'md-avocat-emblem');

    if (newName !== file) {
      const newPath = path.join(assetsDir, newName);
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${file} to ${newName}`);
    }
  }
}

// Check team folder as well
const teamDir = path.join(assetsDir, 'team');
if (fs.existsSync(teamDir)) {
  const files = fs.readdirSync(teamDir);
  for (const file of files) {
    const oldPath = path.join(teamDir, file);
    let newName = file;

    newName = newName.replace(/roger-vangah/g, 'manuela-diabate');
    newName = newName.replace(/rv-avocat/g, 'md-avocat');
    newName = newName.replace(/maitre-vangah/g, 'maitre-diabate');
    newName = newName.replace(/cabinet-vangah/g, 'cabinet-diabate');

    if (newName !== file) {
      const newPath = path.join(teamDir, newName);
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed ${file} to ${newName}`);
    }
  }
}
