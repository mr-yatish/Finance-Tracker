const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkNotifications() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected!\n');

        // Get Notification model
        const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));

        // Find recent notifications
        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        console.log('📊 Recent Notifications:');
        console.log('===============================');
        notifications.forEach((notif, index) => {
            console.log(`\n${index + 1}. Notification ID: ${notif._id}`);
            console.log(`   Title: ${notif.title}`);
            console.log(`   Message: ${notif.message}`);
            console.log(`   Type: ${notif.type}`);
            console.log(`   Read: ${notif.isRead ? '✓' : '✗'}`);
            console.log(`   Deleted: ${notif.isDeleted ? '✓' : '✗'}`);
            console.log(`   Created: ${notif.createdAt}`);
            console.log(`   User ID: ${notif.userId}`);
        });

        console.log('\n===============================');
        console.log(`Total notifications found: ${notifications.length}`);

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkNotifications();
