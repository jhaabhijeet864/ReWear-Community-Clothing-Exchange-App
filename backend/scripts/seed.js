const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Item = require('../models/Item');

// Sample data
const sampleUsers = [
  {
    email: 'admin@rewear.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    username: 'admin',
    role: 'admin',
    isVerified: true,
    points: 1000,
    bio: 'Platform administrator',
    location: 'New York, NY'
  },
  {
    email: 'john@example.com',
    password: 'User123!',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    points: 250,
    bio: 'Fashion enthusiast and sustainability advocate',
    location: 'Los Angeles, CA'
  },
  {
    email: 'jane@example.com',
    password: 'User123!',
    firstName: 'Jane',
    lastName: 'Smith',
    username: 'janesmith',
    points: 180,
    bio: 'Love swapping clothes and meeting new people!',
    location: 'Chicago, IL'
  },
  {
    email: 'mike@example.com',
    password: 'User123!',
    firstName: 'Mike',
    lastName: 'Johnson',
    username: 'mikejohnson',
    points: 320,
    bio: 'Minimalist wardrobe, maximum style',
    location: 'Miami, FL'
  }
];

const sampleItems = [
  {
    title: 'Vintage Denim Jacket',
    description: 'Classic 90s denim jacket in excellent condition. Perfect for layering and adds a cool vintage vibe to any outfit.',
    category: 'outerwear',
    type: 'vintage',
    size: 'M',
    condition: 'excellent',
    brand: 'Levi\'s',
    color: 'Blue',
    material: 'Denim',
    tags: ['vintage', 'denim', 'jacket', '90s'],
    swapType: 'both',
    pointsValue: 150,
    location: 'Los Angeles, CA',
    isFeatured: true
  },
  {
    title: 'Casual White Sneakers',
    description: 'Comfortable and stylish white sneakers. Perfect for everyday wear and goes with everything.',
    category: 'shoes',
    type: 'casual',
    size: '9',
    condition: 'like-new',
    brand: 'Nike',
    color: 'White',
    material: 'Canvas',
    tags: ['sneakers', 'white', 'casual', 'comfortable'],
    swapType: 'both',
    pointsValue: 120,
    location: 'Chicago, IL'
  },
  {
    title: 'Summer Floral Dress',
    description: 'Beautiful floral print dress perfect for summer. Light and airy fabric, great for outdoor events.',
    category: 'dresses',
    type: 'casual',
    size: 'S',
    condition: 'good',
    brand: 'Zara',
    color: 'Multi',
    material: 'Cotton',
    tags: ['dress', 'floral', 'summer', 'casual'],
    swapType: 'both',
    pointsValue: 100,
    location: 'Miami, FL',
    isFeatured: true
  },
  {
    title: 'Business Blazer',
    description: 'Professional black blazer suitable for office wear. Well-maintained and ready for business meetings.',
    category: 'outerwear',
    type: 'business',
    size: 'L',
    condition: 'excellent',
    brand: 'H&M',
    color: 'Black',
    material: 'Polyester',
    tags: ['blazer', 'business', 'professional', 'office'],
    swapType: 'both',
    pointsValue: 200,
    location: 'New York, NY'
  },
  {
    title: 'Cozy Sweater',
    description: 'Warm and comfortable sweater perfect for cold weather. Soft material and great fit.',
    category: 'tops',
    type: 'casual',
    size: 'M',
    condition: 'good',
    brand: 'Gap',
    color: 'Gray',
    material: 'Wool',
    tags: ['sweater', 'warm', 'cozy', 'winter'],
    swapType: 'both',
    pointsValue: 80,
    location: 'Chicago, IL'
  },
  {
    title: 'Leather Crossbody Bag',
    description: 'Stylish leather crossbody bag with multiple compartments. Perfect for daily use and travel.',
    category: 'bags',
    type: 'casual',
    size: 'one-size',
    condition: 'like-new',
    brand: 'Fossil',
    color: 'Brown',
    material: 'Leather',
    tags: ['bag', 'leather', 'crossbody', 'travel'],
    swapType: 'both',
    pointsValue: 180,
    location: 'Los Angeles, CA',
    isFeatured: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('Existing data cleared');

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create items
    console.log('Creating items...');
    const userIndexes = [1, 2, 3, 1, 2, 3]; // Distribute items among regular users
    
    for (let i = 0; i < sampleItems.length; i++) {
      const itemData = {
        ...sampleItems[i],
        owner: createdUsers[userIndexes[i]]._id,
        status: 'available',
        images: [
          {
            url: `/uploads/items/sample-${i + 1}.jpg`,
            publicId: `sample-${i + 1}`,
            isPrimary: true
          }
        ]
      };
      
      const item = new Item(itemData);
      await item.save();
      console.log(`Created item: ${item.title}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample users created:');
    createdUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role} - ${user.points} points`);
    });

    console.log('\nSample items created:');
    for (let i = 0; i < sampleItems.length; i++) {
      console.log(`- ${sampleItems[i].title} (${sampleItems[i].category})`);
    }

    console.log('\nYou can now:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Test the API endpoints');
    console.log('3. Use the admin account (admin@rewear.com / Admin123!) to access admin features');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase(); 