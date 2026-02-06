const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function createNotificationIndexes() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        console.log('\n📊 Creating indexes...\n');

        // UserDevice indexes
        console.log('Creating UserDevice indexes...');
        await db.collection('userdevices').createIndex(
            { userId: 1, fcmToken: 1 },
            { unique: true, name: 'userId_fcmToken_unique' }
        );
        await db.collection('userdevices').createIndex(
            { fcmToken: 1 },
            { name: 'fcmToken_index' }
        );
        await db.collection('userdevices').createIndex(
            { isActive: 1 },
            { name: 'isActive_index' }
        );
        await db.collection('userdevices').createIndex(
            { lastUsed: 1, isActive: 1 },
            { name: 'lastUsed_isActive_index' }
        );
        console.log('✅ UserDevice indexes created');

        // Notification indexes
        console.log('Creating Notification indexes...');
        await db.collection('notifications').createIndex(
            { userId: 1, createdAt: -1 },
            { name: 'userId_createdAt_index' }
        );
        await db.collection('notifications').createIndex(
            { userId: 1, isRead: 1 },
            { name: 'userId_isRead_index' }
        );
        await db.collection('notifications').createIndex(
            { userId: 1, type: 1 },
            { name: 'userId_type_index' }
        );
        await db.collection('notifications').createIndex(
            { userId: 1, isDeleted: 1 },
            { name: 'userId_isDeleted_index' }
        );
        console.log('✅ Notification indexes created');

        // NotificationPreference indexes
        console.log('Creating NotificationPreference indexes...');
        await db.collection('notificationpreferences').createIndex(
            { userId: 1 },
            { unique: true, name: 'userId_unique' }
        );
        console.log('✅ NotificationPreference indexes created');

        console.log('\n🎉 All indexes created successfully!\n');

        // List all indexes
        console.log('📋 Current indexes:\n');

        const collections = ['userdevices', 'notifications', 'notificationpreferences'];
        for (const collectionName of collections) {
            const indexes = await db.collection(collectionName).indexes();
            console.log(`${collectionName}:`);
            indexes.forEach(index => {
                console.log(`  - ${index.name}`);
            });
            console.log('');
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
}

createNotificationIndexes();
