const mongoose = require('mongoose');
require('dotenv').config();

async function dropMobileIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lostfound');
    console.log('Connected to MongoDB');

    // Drop the index
    await mongoose.connection.collection('users').dropIndex('mobileNumber_1');
    console.log('Successfully dropped the mobileNumber_1 index');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

dropMobileIndex(); 