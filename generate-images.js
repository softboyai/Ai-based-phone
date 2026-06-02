/**
 * Generate Phone Placeholder Images
 * 
 * Creates unique SVG images for each phone in the system.
 * Run this script after seeding: node generate-images.js
 */

const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');

// Phone image data with brand colors
const phoneImages = [
    { file: 'samsung-a15.jpg', name: 'Galaxy A15', brand: 'Samsung', color: '#1428a0' },
    { file: 'samsung-a55.jpg', name: 'Galaxy A55', brand: 'Samsung', color: '#1428a0' },
    { file: 'iphone-14.jpg', name: 'iPhone 14', brand: 'Apple', color: '#333333' },
    { file: 'tecno-spark20.jpg', name: 'Spark 20', brand: 'Tecno', color: '#0066cc' },
    { file: 'tecno-camon30.jpg', name: 'Camon 30', brand: 'Tecno', color: '#0066cc' },
    { file: 'infinix-hot40.jpg', name: 'Hot 40', brand: 'Infinix', color: '#00a651' },
    { file: 'infinix-note40.jpg', name: 'Note 40', brand: 'Infinix', color: '#00a651' },
    { file: 'nokia-g42.jpg', name: 'G42', brand: 'Nokia', color: '#124191' },
    { file: 'samsung-s23.jpg', name: 'Galaxy S23', brand: 'Samsung', color: '#1428a0' },
    { file: 'tecno-phantom.jpg', name: 'Phantom V', brand: 'Tecno', color: '#0066cc' }
];

function generateSVG(phone) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${phone.color};stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:${phone.color};stop-opacity:0.05"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <rect x="140" y="50" width="120" height="240" rx="20" fill="${phone.color}" opacity="0.9"/>
  <rect x="150" y="70" width="100" height="180" rx="5" fill="#ffffff"/>
  <rect x="160" y="80" width="80" height="100" rx="3" fill="${phone.color}" opacity="0.15"/>
  <circle cx="200" cy="270" r="12" fill="#ffffff" opacity="0.5"/>
  <circle cx="200" cy="60" r="4" fill="#ffffff" opacity="0.4"/>
  <text x="200" y="330" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="bold" fill="${phone.color}">${phone.name}</text>
  <text x="200" y="355" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#666666">${phone.brand}</text>
  <text x="200" y="385" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#999999">KT Phones</text>
</svg>`;
}

// Generate images
console.log('🖼️  Generating phone images...');

phoneImages.forEach(phone => {
    // Save as SVG with .jpg extension (browsers will still render it)
    // Actually let's save as proper SVG files and update references
    const svgFile = phone.file.replace('.jpg', '.svg');
    const svgPath = path.join(imagesDir, svgFile);
    fs.writeFileSync(svgPath, generateSVG(phone));
    console.log(`   ✅ Created ${svgFile}`);
});

console.log('\n✅ All phone images generated!');
console.log('📝 Note: These are placeholder images. Replace them with real photos by uploading through the admin panel.');
