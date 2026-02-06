const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function cleanupNotifications() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        console.log('\n🧹 Starting cleanup...\n');

        // 1. Delete soft-deleted notifications older than 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const deletedCount = await db.collection('notifications').deleteMany({
            createdAt: { $lt: ninetyDaysAgo },
            isDeleted: true
        });
        console.log(`✅ Deleted ${deletedCount.deletedCount} old notifications (older than 90 days)`);

        // 2. Mark inactive devices (not used in 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const updatedDevices = await db.collection('userdevices').updateMany(
            { lastUsed: { $lt: thirtyDaysAgo }, isActive: true },
            { $set: { isActive: false } }
        );
        console.log(`✅ Marked ${updatedDevices.modifiedCount} inactive devices (not used in 30 days)`);

        // 3. Get statistics
        const totalNotifications = await db.collection('notifications').countDocuments({});
        const unreadNotifications = await db.collection('notifications').countDocuments({ isRead: false, isDeleted: false });
        const activeDevices = await db.collection('userdevices').countDocuments({ isActive: true });

        console.log('\n📊 Statistics:');
        console.log(`  Total notifications: ${totalNotifications}`);
        console.log(`  Unread notifications: ${unreadNotifications}`);
        console.log(`  Active devices: ${activeDevices}\n`);

        await mongoose.disconnect();
        console.log('✅ Cleanup completed successfully!');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupNotifications();
