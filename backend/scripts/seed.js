const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Item.deleteMany();
    await Claim.deleteMany();
    await Notification.deleteMany();
    console.log('Cleared existing database entries.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'University Admin',
        email: 'admin@mycollege.edu',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'john.doe@mycollege.edu',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@mycollege.edu',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Alice Johnson',
        email: 'alice.j@mycollege.edu',
        password: 'password123',
        role: 'student'
      }
    ]);

    const [adminUser, studentA, studentB, studentC] = users;
    console.log('Seeded 4 users (1 Admin, 3 Students)');

    // 2. Create Items
    const items = await Item.create([
      // Lost Items
      {
        title: 'Black Leather Wallet',
        description: 'Lost a black Tommy Hilfiger leather wallet. Contains student ID card and bus pass.',
        category: 'Wallets',
        itemType: 'Lost',
        location: 'Student Activity Center',
        imageUrl: '',
        date: new Date('2026-06-02'),
        securityQuestion: 'What is the name on the student ID card inside?',
        status: 'Lost',
        postedBy: studentA._id
      },
      {
        title: 'iPhone 13 Blue Case',
        description: 'Lost an iPhone 13 with a light blue silicone case and a sticker of a cat on the back.',
        category: 'Electronics',
        itemType: 'Lost',
        location: 'Science Building Auditorium',
        imageUrl: '',
        date: new Date('2026-06-04'),
        securityQuestion: 'What sticker is on the back of the case?',
        status: 'Lost',
        postedBy: studentB._id
      },
      {
        title: 'Calculus Made Easy Textbook',
        description: 'Calculus textbook with some highlighted pages in Chapter 4. Cover is slightly torn.',
        category: 'Books',
        itemType: 'Lost',
        location: 'Central Library 2nd Floor',
        imageUrl: '',
        date: new Date('2026-06-01'),
        status: 'Lost',
        postedBy: studentC._id
      },

      // Found Items
      {
        title: 'Tommy Hilfiger Wallet',
        description: 'Found a black leather Tommy Hilfiger wallet near the cafeteria tables. Kept safe at reception.',
        category: 'Wallets',
        itemType: 'Found',
        location: 'Cafeteria',
        imageUrl: '',
        date: new Date('2026-06-03'),
        securityQuestion: 'What is the full name on the ID card inside?',
        status: 'Found',
        postedBy: studentB._id
      },
      {
        title: 'iPhone 13 Blue Case Cat Sticker',
        description: 'Found a light blue iPhone 13 on a chair in the Science Building. Has a cat sticker on the back.',
        category: 'Electronics',
        itemType: 'Found',
        location: 'Science Building Hallway',
        imageUrl: '',
        date: new Date('2026-06-05'),
        securityQuestion: 'Describe the sticker on the back of the phone.',
        status: 'Found',
        postedBy: studentA._id
      },
      {
        title: 'Keys with Red Lanyard',
        description: 'Found a set of keys with a red lanyard saying "Athletics". Has 3 keys and a small USB drive.',
        category: 'Keys',
        itemType: 'Found',
        location: 'College Gymnasium Gym Floor',
        imageUrl: '',
        date: new Date('2026-06-03'),
        securityQuestion: 'What brand is written on the USB flash drive?',
        status: 'Found',
        postedBy: studentC._id
      }
    ]);

    console.log('Seeded 6 items (3 Lost, 3 Found)');

    // 3. Create a Claim Request
    // Jane Smith (studentB) claims the Black Leather Wallet posted by John Doe (studentA)
    const walletItem = items[0];
    const claim = await Claim.create({
      itemId: walletItem._id,
      claimantId: studentB._id,
      answer: 'My student ID name says John Doe'
    });

    console.log('Seeded 1 active claim');

    // 4. Create Notification
    await Notification.create({
      recipient: studentA._id,
      sender: studentB._id,
      type: 'new_claim',
      item: walletItem._id,
      message: 'Jane Smith has claimed your item "Black Leather Wallet". Check their answer to your security question.'
    });

    console.log('Seeded 1 starting notification');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
