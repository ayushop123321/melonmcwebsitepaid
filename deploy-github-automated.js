// Automated GitHub Pages deployment script for MelonMC website
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// GitHub configuration - CHANGE THESE VALUES
const GITHUB_USERNAME = 'AyushAJogania';
const GITHUB_REPO = `${GITHUB_USERNAME}.github.io`;
const GITHUB_REPO_URL = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git`;

console.log('🚀 Starting automated MelonMC website deployment to GitHub Pages...');
console.log(`📝 Using GitHub repository: ${GITHUB_REPO_URL}`);

// Create a deploy folder if it doesn't exist
const deployDir = path.join(__dirname, 'github-deploy');
console.log('🧹 Cleaning/creating deploy directory...');
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

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
    if (fs.existsSync(path.join(__dirname, file))) {
      fs.copyFileSync(path.join(__dirname, file), path.join(deployDir, file));
      console.log(`✅ Copied ${file}`);
    } else {
      console.log(`⚠️ File not found: ${file} - skipping`);
    }
  } catch (err) {
    console.log(`⚠️ Error copying ${file}: ${err.message}`);
  }
});

// Copy directories
const dirsToCopy = ['assets', 'admin', 'announcements'];
dirsToCopy.forEach(dir => {
  try {
    if (fs.existsSync(path.join(__dirname, dir))) {
      copyDirectory(path.join(__dirname, dir), path.join(deployDir, dir));
      console.log(`✅ Copied directory ${dir}`);
    } else {
      console.log(`⚠️ Directory not found: ${dir} - skipping`);
    }
  } catch (err) {
    console.log(`⚠️ Error copying directory ${dir}: ${err.message}`);
  }
});

// Create a .nojekyll file to bypass Jekyll processing
fs.writeFileSync(path.join(deployDir, '.nojekyll'), '');
console.log('✅ Created .nojekyll file');

// Create a CNAME file if you have a custom domain
// fs.writeFileSync(path.join(deployDir, 'CNAME'), 'melonmc.com');
// console.log('✅ Created CNAME file');

// Initialize git in the deploy directory
try {
  console.log('🔧 Setting up Git repository...');
  process.chdir(deployDir);
  
  // Initialize git
  execSync('git init');
  console.log('✅ Git initialized');
  
  // Configure git (optional)
  try {
    execSync('git config user.name "MelonMC Deployment"');
    execSync('git config user.email "deployment@melonmc.com"');
    console.log('✅ Git user configured');
  } catch (configError) {
    console.log('⚠️ Could not configure git user - using system defaults');
  }
  
  // Add all files
  execSync('git add .');
  console.log('✅ Files staged');
  
  // Commit
  execSync('git commit -m "Deploy MelonMC website to GitHub Pages"');
  console.log('✅ Changes committed');
  
  // Add remote (this will fail if the repository doesn't exist)
  try {
    execSync(`git remote add origin ${GITHUB_REPO_URL}`);
    console.log('✅ Remote added');
    
    // Try to push (this will fail if the repository doesn't exist or credentials are missing)
    try {
      console.log('🔄 Pushing to GitHub...');
      execSync('git push -f -u origin master');
      console.log('✅ Successfully pushed to GitHub!');
      
      console.log('');
      console.log('🎉 Deployment successful!');
      console.log(`🌐 Your website should be live at: https://${GITHUB_USERNAME}.github.io`);
      console.log('It may take a few minutes for GitHub Pages to build and deploy your site.');
      console.log('');
    } catch (pushError) {
      console.log('⚠️ Could not push to GitHub. Manual steps required:');
      console.log('');
      console.log('1. Go to https://github.com/new');
      console.log(`2. Create a new repository named "${GITHUB_REPO}"`);
      console.log('3. Then run these commands in the github-deploy folder:');
      console.log(`   cd "${deployDir}"`);
      console.log(`   git remote add origin ${GITHUB_REPO_URL}`);
      console.log('   git push -f -u origin master');
      console.log('');
    }
  } catch (remoteError) {
    console.log('⚠️ Could not add remote. Manual steps required:');
    console.log('');
    console.log('1. Go to https://github.com/new');
    console.log(`2. Create a new repository named "${GITHUB_REPO}"`);
    console.log('3. Then run these commands in the github-deploy folder:');
    console.log(`   cd "${deployDir}"`);
    console.log(`   git remote add origin ${GITHUB_REPO_URL}`);
    console.log('   git push -f -u origin master');
    console.log('');
  }
  
} catch (err) {
  console.error(`⚠️ Error setting up git repository: ${err.message}`);
  console.log('');
  console.log('Please ensure Git is installed and try again.');
  console.log('');
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