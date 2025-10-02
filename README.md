# MelonMC Website

The official website for MelonMC Minecraft server.

## Features

- Server information and join details
- Server hosting plans and packages
- Server rules and guidelines
- Announcements system synced with Discord
- Dynamic content loading

## Technologies Used

- HTML, CSS, JavaScript
- Node.js for deployment scripts
- Discord integration for announcements

## Local Development

To run the site locally:

1. Ensure you have Node.js installed
2. Run `node serve.js` to start a local server
3. Access the site at `http://localhost:3000`

## Deployment Options

This website can be deployed in multiple ways:

### Option 1: Using the automated GitHub Pages script

1. Run the deployment script:
   ```
   node deploy-github-automated.js
   ```
2. Follow any additional instructions provided by the script

### Option 2: Using Netlify

1. Run the Netlify preparation script:
   ```
   node deploy-netlify.js
   ```
2. Deploy using Netlify CLI or drag-and-drop the generated `netlify` folder

### Option 3: Manual deployment

1. Run the basic deployment preparation script:
   ```
   node deploy.js
   ```
2. Upload the generated `deploy` folder to any web hosting service

## Website Structure

- `index.html`: Main landing page
- `announcements.html`: Server announcements
- `ranks.html`: Information about hosting plans and packages
- `server-info.html`: Server details and how to join
- `rules.html`: Server rules and guidelines
- `assets/`: Images, icons, and other static assets
- `announcements/`: JSON data for announcements
- `admin/`: Administrator tools and configuration

## Project Structure

- `index.html` - Homepage with server information and category selection
- `coins-lifesteal.html` - LifeSteal Coins shop page
- `ranks-lifesteal.html` - LifeSteal hosting packages page
- `coins-classic.html` - Classic service add-ons page
- `ranks-classic.html` - Classic hosting packages page
- `player-ranks.html` - General hosting plans page
- `styles.css` - Main stylesheet for the website
- `script.js` - JavaScript functionality

## Payment System

The website uses a UPI QR code payment system. After payment, users need to:

1. Join the Discord server
2. Share their payment screenshot with their Minecraft username
3. An admin will verify the payment and deliver the purchased item in-game

## Assets

For the website to function correctly, you need to add the following assets:

- `/assets/logo.png` - The server logo
- `/assets/hero-bg.jpg` - Background image for the hero section
- `/assets/bg-texture.png` - Background texture for the website
- `/assets/qr-code.png` - The UPI QR code for payments
- `/assets/categories/` - Category images
- `/assets/ranks/` - Hosting plan images for website
- `/assets/coins/` - Coin package images for shop

## Discord Integration

The website integrates with the MelonMC Discord server at: https://discord.gg/7fKJwXnQrB

## Server Address

The MelonMC Minecraft server is accessible at: `play.melon-mc.fun:19141` 