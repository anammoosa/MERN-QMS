const mongoose = require('./server/auth-service/node_modules/mongoose');
const User = require('./server/auth-service/src/models/User'); // Adjust path as needed
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server/auth-service/.env') });

const seedAdmin = async () => {
    try {
        // Hardcode URI if dotenv fails path resolution in root
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/qms-auth';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const adminExists = await User.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const admin = new User({
            username: 'admin',
            password: 'adminpassword123', // Will be hashed by pre-save hook
            role: 'Admin'
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: adminpassword123');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
