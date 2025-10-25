const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB using MONGODB_URI from .env
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/eswari-physio';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if admin already exists (by phone number)
    let admin = await User.findOne({ phone: '9524350214' });
    
    if (admin) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('================================');
      console.log('Phone: 9524350214');
      console.log('Email: adminsiva@eswari.com');
      console.log('Password: eshu@10th469');
      console.log('================================');
      console.log('You can login with phone or email\n');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    admin = new User({
      name: 'Eswari',
      email: 'adminsiva@eswari.com',
      phone: '9524350214',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    
    console.log('\n✅ Admin user created successfully!');
    console.log('================================');
    console.log('Phone: 9524350214');
    console.log('Email: adminsiva@eswari.com');
    console.log('Password: eshu@10th469');
    console.log('================================');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('You can login using either phone or email\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MongoDB is running');
    console.error('2. Check your MONGODB_URI in .env file');
    console.error('3. Verify your internet connection (if using MongoDB Atlas)');
    console.error('4. Make sure your IP is whitelisted in MongoDB Atlas\n');
    process.exit(1);
  }
}

createAdmin();