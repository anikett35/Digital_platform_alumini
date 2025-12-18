const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed automatically by your User model
      role: 'admin',
      department: 'Administration',
      phoneNumber: '1234567890',
      isActive: true,
      // Add required fields for your schema
      studentId: 'ADMIN001',
      currentYear: 1,
      enrollmentYear: new Date().getFullYear(),
      profileVisibility: 'public'
    };

    // Check if admin exists
    let admin = await User.findOne({ email: 'admin@example.com' });
    
    if (admin) {
      console.log('⚠️  Admin already exists, updating...');
      
      // Update admin fields
      admin.name = adminData.name;
      admin.role = 'admin';
      admin.department = adminData.department;
      admin.phoneNumber = adminData.phoneNumber;
      admin.isActive = true;
      
      // Update password if provided (it will be hashed by pre-save hook)
      if (adminData.password) {
        admin.password = adminData.password;
      }
      
      await admin.save();
      console.log('✅ Admin updated successfully!');
    } else {
      // Create new admin
      admin = new User(adminData);
      await admin.save();
      console.log('✅ Admin created successfully!');
    }

    console.log('\n📧 Admin Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    
    if (error.code === 11000) {
      console.error('Duplicate email detected!');
    }
    
    process.exit(1);
  }
};

createAdmin();