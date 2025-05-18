// GitHub Pages deployment script for MelonMC website
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting MelonMC website deployment to GitHub Pages...');

// Create a deploy folder if it doesn't exist
const deployDir = path.join(__dirname, 'deploy');
if (!fs.existsSync(deployDir)) {
  console.log('📁 Creating deploy directory...');
  fs.mkdirSync(deployDir, { recursive: true });
} else {
  // Clean the deploy directory first
  console.log('🧹 Cleaning deploy directory...');
  fs.rmSync(deployDir, { recursive: true, force: true });
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

// Create a .nojekyll file to bypass Jekyll processing
fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');
console.log('✅ Created .nojekyll file');

// Initialize git in the deploy directory
try {
  console.log('🔧 Setting up Git repository...');
  process.chdir(deployDir);
  
  // Initialize git
  execSync('git init');
  console.log('✅ Git initialized');
  
  // Add all files
  execSync('git add .');
  console.log('✅ Files staged');
  
  // Commit
  execSync('git commit -m "Deploy MelonMC website to GitHub Pages"');
  console.log('✅ Changes committed');
  
  // Create GitHub repository URL from username
  console.log('');
  console.log('🌐 GitHub Pages Deployment Instructions:');
  console.log('');
  console.log('1. Create a GitHub repository named: yourusername.github.io');
  console.log('2. Run these commands in the deploy folder:');
  console.log('   git remote add origin https://github.com/yourusername/yourusername.github.io.git');
  console.log('   git push -u origin master');
  console.log('');
  console.log('3. Wait a few minutes, then visit: https://yourusername.github.io');
  console.log('');
  
} catch (err) {
  console.error(`⚠️ Error setting up git repository: ${err.message}`);
}

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