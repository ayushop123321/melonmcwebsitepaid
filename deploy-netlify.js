// Netlify deployment script for MelonMC website
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting MelonMC website deployment to Netlify...');

// Create a netlify folder if it doesn't exist
const deployDir = path.join(__dirname, 'netlify');
if (!fs.existsSync(deployDir)) {
  console.log('📁 Creating netlify directory...');
  fs.mkdirSync(deployDir, { recursive: true });
} else {
  // Clean the deploy directory first
  console.log('🧹 Cleaning netlify directory...');
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

// Create a netlify.toml file
const netlifyConfig = `
[build]
  publish = "/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

fs.writeFileSync(path.join(deployDir, 'netlify.toml'), netlifyConfig);
console.log('✅ Created netlify.toml file');

console.log('');
console.log('🌐 Netlify Deployment Instructions:');
console.log('');
console.log('1. Go to https://app.netlify.com/');
console.log('2. Create new site from Git');
console.log('3. Connect to your GitHub/GitLab/Bitbucket');
console.log('4. Select your repository');
console.log('5. Click "Deploy site"');
console.log('');
console.log('👉 Or use netlify-cli to deploy directly from the command line:');
console.log('   npx netlify-cli deploy --dir netlify');
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