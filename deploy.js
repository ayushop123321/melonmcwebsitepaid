// Simple deployment script for MelonMC website
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting MelonMC website deployment...');

// Create a deploy folder if it doesn't exist
const deployDir = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployDir)) {
  console.log('📁 Creating deploy directory...');
  fs.mkdirSync(deployDir, { recursive: true });
}

// Copy all website files to deploy folder
console.log('📋 Copying website files...');
const filesToCopy = [
  'index.html',
  'script.js',
  'styles.css',
  'announcements.html',
  'features.html',
  'ranks.html',
  'rules.html',
  'server-info.html',
  'player-ranks.html',
  'player-ranks-list.html',
  'ranks-classic.html',
  'coins-classic.html',
  'ranks-lifesteal.html',
  'coins-lifesteal.html',
  'navbar.html',
  'terms.html',
  'melon-particles.svg',
  '_redirects',
  'README.md'
];

filesToCopy.forEach(file => {
  try {
    fs.copyFileSync(path.join(__dirname, file), path.join(deployDir, file));
    console.log(`✅ Copied ${file}`);
  } catch (err) {
    console.log(`⚠️ Error copying ${file}: ${err.message}`);
  }
});

// Copy directories
const dirsToCopy = ['assets', 'admin', 'announcements'];
dirsToCopy.forEach(dir => {
  try {
    copyDirectory(path.join(__dirname, dir), path.join(deployDir, dir));
    console.log(`✅ Copied directory ${dir}`);
  } catch (err) {
    console.log(`⚠️ Error copying directory ${dir}: ${err.message}`);
  }
});

console.log('🔧 Website prepared for deployment');
console.log('');
console.log('Next steps:');
console.log('1. Upload the contents of the "deploy" folder to your web host');
console.log('2. Or initialize a new git repository in the deploy folder');
console.log('3. Push to GitHub Pages');
console.log('');

// Helper function to copy a directory recursively
function copyDirectory(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const srcPath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
} 