const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'items');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sample items from seed.js with their categories
const sampleItems = [
  { id: 1, title: 'Vintage Denim Jacket', category: 'outerwear' },
  { id: 2, title: 'Casual White Sneakers', category: 'shoes' },
  { id: 3, title: 'Summer Floral Dress', category: 'dresses' },
  { id: 4, title: 'Business Blazer', category: 'outerwear' },
  { id: 5, title: 'Cozy Sweater', category: 'tops' },
  { id: 6, title: 'Leather Crossbody Bag', category: 'bags' }
];

console.log('🎨 Mock Image Generator for ReWear');
console.log('=====================================\n');

console.log('Since canvas installation is problematic on Windows, here are your options:\n');

console.log('✅ OPTION 1: Use Online Placeholder Services');
console.log('---------------------------------------------');
sampleItems.forEach(item => {
  const placeholderUrl = `https://via.placeholder.com/400x400/${getCategoryColor(item.category)}/FFFFFF?text=${encodeURIComponent(item.category.toUpperCase())}`;
  console.log(`${item.id}. ${item.title} (${item.category}):`);
  console.log(`   ${placeholderUrl}`);
  console.log('');
});

console.log('✅ OPTION 2: Download Free Stock Photos');
console.log('----------------------------------------');
console.log('1. Go to https://unsplash.com/ or https://pexels.com/');
console.log('2. Search for:');
sampleItems.forEach(item => {
  console.log(`   - "${item.category}" (for ${item.title})`);
});
console.log('3. Download 6 images and rename them to:');
sampleItems.forEach(item => {
  console.log(`   - sample-${item.id}.jpg`);
});

console.log('✅ OPTION 3: Use Simple Color Blocks');
console.log('-------------------------------------');
console.log('Create simple 400x400 images with these colors:');
const colors = {
  tops: '#FF6B6B',
  bottoms: '#4ECDC4', 
  dresses: '#45B7D1',
  outerwear: '#96CEB4',
  shoes: '#FFEAA7',
  accessories: '#DDA0DD',
  jewelry: '#FFB6C1',
  bags: '#98D8C8',
  hats: '#F7DC6F',
  scarves: '#BB8FCE'
};

Object.entries(colors).forEach(([category, color]) => {
  console.log(`   ${category}: ${color}`);
});

console.log('\n📁 Save all images in: ' + uploadsDir);
console.log('\n🚀 After adding images, run: npm run seed');

function getCategoryColor(category) {
  const colors = {
    tops: 'FF6B6B',
    bottoms: '4ECDC4', 
    dresses: '45B7D1',
    outerwear: '96CEB4',
    shoes: 'FFEAA7',
    accessories: 'DDA0DD',
    jewelry: 'FFB6C1',
    bags: '98D8C8',
    hats: 'F7DC6F',
    scarves: 'BB8FCE'
  };
  return colors[category] || 'E0E0E0';
} 