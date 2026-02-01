const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('.env.local file not found!');
            return;
        }
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                // Handle quotes if present (basic)
                envVars[key] = value.replace(/^["'](.*)["']$/, '$1');
            }
        });

        const mongoUrl = envVars.MONGODB_URL;
        if (!mongoUrl) {
            console.error('MONGODB_URL not found in .env.local');
            return;
        }

        // Mask password for log
        const maskedUrl = mongoUrl.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.*)/, '$1****$3');
        console.log(`Attempting to connect to: ${maskedUrl}`);

        await mongoose.connect(mongoUrl, {
            dbName: 'finance-tracker',
            bufferCommands: false,
        });
        console.log('SUCCESS: Connected to MongoDB');
        await mongoose.disconnect();
    } catch (error) {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error(error);
    }
}

test();
