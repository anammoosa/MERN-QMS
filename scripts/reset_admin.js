const mongoose = require('../server/auth-service/node_modules/mongoose');
const User = require('../server/auth-service/src/models/User'); // Adjust path as needed
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/auth-service/.env') });

const resetAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        console.log('Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        await User.deleteOne({ username: 'admin' });
        console.log('Deleted existing admin.');

        const admin = new User({
            username: 'admin',
            password: 'adminpassword123',
            role: 'Admin'
        });

        await admin.save();
        console.log('Admin user recreated successfully');
        console.log('Username: admin');
        console.log('Password: adminpassword123');

        // Verification: Compare
        const isMatch = await admin.comparePassword('adminpassword123');
        console.log('Self-verification of password match:', isMatch);

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

resetAdmin();
