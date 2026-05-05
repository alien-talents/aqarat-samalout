#!/usr/bin/env node

/**
 * Icon Generator for Aqarat Samalout PWA
 * 
 * This script generates all required PWA icon sizes from the SVG template.
 * 
 * Usage:
 *   node scripts/generate-icons.js
 * 
 * Requirements:
 *   npm install canvas
 */

const fs = require('fs');
const path = require('path');

// Try to use canvas, fallback to SVG if not available
let canvas, createCanvas, loadImage;
try {
  const canvasLib = require('canvas');
  createCanvas = canvasLib.createCanvas;
  loadImage = canvasLib.loadImage;
  canvas = true;
} catch {
  canvas = false;
  console.log('Canvas not available, will create SVG icons instead...');
}

const SIZES = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// SVG Template with gradients
const getSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24"/>
      <stop offset="100%" style="stop-color:#f59e0b"/>
    </linearGradient>
  </defs>
  
  <rect width="512" height="512" fill="url(#bg)" rx="80"/>
  <circle cx="256" cy="256" r="180" fill="url(#gold)"/>
  <text x="256" y="310" font-family="Arial, sans-serif" font-size="220" font-weight="bold" fill="#0f172a" text-anchor="middle">S</text>
</svg>`;

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  if (canvas) {
    // Generate PNG icons using canvas
    for (const size of SIZES) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Background - dark blue gradient
      const bgGradient = ctx.createLinearGradient(0, 0, size, size);
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGradient;
      
      // Rounded rect
      const radius = size * 0.15;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.fill();

      // Gold circle
      const goldGradient = ctx.createLinearGradient(0, 0, size, size);
      goldGradient.addColorStop(0, '#fbbf24');
      goldGradient.addColorStop(1, '#f59e0b');
      ctx.beginPath();
      ctx.arc(size/2, size/2, size*0.35, 0, Math.PI * 2);
      ctx.fillStyle = goldGradient;
      ctx.fill();

      // Letter S
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${size * 0.43}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', size/2, size/2 + size*0.02);

      // Save PNG
      const buffer = canvas.toBuffer('image/png');
      const filename = `icon-${size}x${size}.png`;
      fs.writeFileSync(path.join(PUBLIC_DIR, filename), buffer);
      console.log(`✅ ${filename}`);
    }

    // Also create maskable icons (with padding for safe zone)
    const maskableSizes = [192, 512];
    for (const size of maskableSizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Dark background (full square for maskable)
      const bgGradient = ctx.createLinearGradient(0, 0, size, size);
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, size, size);

      // Gold circle (smaller for safe zone)
      const goldGradient = ctx.createLinearGradient(0, 0, size, size);
      goldGradient.addColorStop(0, '#fbbf24');
      goldGradient.addColorStop(1, '#f59e0b');
      ctx.beginPath();
      ctx.arc(size/2, size/2, size*0.3, 0, Math.PI * 2);
      ctx.fillStyle = goldGradient;
      ctx.fill();

      // Letter S
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${size * 0.37}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', size/2, size/2 + size*0.02);

      const buffer = canvas.toBuffer('image/png');
      const filename = `icon-maskable-${size}x${size}.png`;
      fs.writeFileSync(path.join(PUBLIC_DIR, filename), buffer);
      console.log(`✅ ${filename} (maskable)`);
    }

  } else {
    // Fallback: Generate SVG icons
    console.log('⚠️  Canvas library not found. Installing...');
    console.log('Please run: npm install canvas');
    console.log('\nOr manually create icons using the SVG files.\n');
    
    // Save SVG files as fallback
    for (const size of SIZES) {
      const filename = `icon-${size}x${size}.svg`;
      fs.writeFileSync(path.join(PUBLIC_DIR, filename), getSVG(size));
      console.log(`✅ ${filename} (SVG fallback)`);
    }
  }

  // Create Apple touch icon (180x180 with padding)
  if (canvas) {
    const size = 180;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // White background (Apple style)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    // Gold circle
    const goldGradient = ctx.createLinearGradient(0, 0, size, size);
    goldGradient.addColorStop(0, '#fbbf24');
    goldGradient.addColorStop(1, '#f59e0b');
    ctx.beginPath();
    ctx.arc(size/2, size/2, size*0.35, 0, Math.PI * 2);
    ctx.fillStyle = goldGradient;
    ctx.fill();

    // Letter S
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${size * 0.43}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', size/2, size/2 + size*0.02);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), buffer);
    console.log(`✅ apple-touch-icon.png`);
  }

  // Create favicon.ico (multi-size ICO file - simplified as PNG)
  if (canvas) {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');

    // Simple S on dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 16, 17);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), buffer);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-16x16.png'), buffer);
    console.log(`✅ favicon-32x32.png`);
    console.log(`✅ favicon-16x16.png`);
  }

  console.log('\n✨ All icons generated successfully!');
  console.log(`📁 Location: ${PUBLIC_DIR}`);
  console.log('\n🚀 You can now run:');
  console.log('   npm run dev');
  console.log('\nThen test PWA install in Chrome/Edge at:');
  console.log('   http://localhost:5173');
}

// Run
generateIcons().catch(console.error);
