const https = require('https');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'items');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sample items with placeholder URLs
const sampleItems = [
  { 
    id: 1, 
    title: 'Vintage Denim Jacket', 
    category: 'outerwear',
    url: 'https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=OUTERWEAR'
  },
  { 
    id: 2, 
    title: 'Casual White Sneakers', 
    category: 'shoes',
    url: 'https://via.placeholder.com/400x400/FFEAA7/FFFFFF?text=SHOES'
  },
  { 
    id: 3, 
    title: 'Summer Floral Dress', 
    category: 'dresses',
    url: 'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=DRESSES'
  },
  { 
    id: 4, 
    title: 'Business Blazer', 
    category: 'outerwear',
    url: 'https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=OUTERWEAR'
  },
  { 
    id: 5, 
    title: 'Cozy Sweater', 
    category: 'tops',
    url: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=TOPS'
  },
  { 
    id: 6, 
    title: 'Leather Crossbody Bag', 
    category: 'bags',
    url: 'https://via.placeholder.com/400x400/98D8C8/FFFFFF?text=BAGS'
  }
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(uploadsDir, filename));
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Add empty callback
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('📥 Downloading placeholder images...\n');
  
  for (const item of sampleItems) {
    try {
      await downloadImage(item.url, `sample-${item.id}.jpg`);
    } catch (error) {
      console.error(`❌ Error downloading ${item.title}:`, error.message);
    }
  }
  
  console.log('\n🎉 All images downloaded successfully!');
  console.log(`📁 Images saved to: ${uploadsDir}`);
  console.log('\n🚀 You can now run: npm run seed');
}

downloadAllImages(); 