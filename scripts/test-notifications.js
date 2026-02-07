#!/usr/bin/env node

/**
 * Quick test script for notification system
 * Run with: node scripts/test-notifications.js
 */

console.log('🔔 Notification System Test Script\n');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const BASE_URL = 'http://localhost:3000';

async function testInAppNotification() {
    console.log('\n📬 Testing In-App Notification (Toast)...\n');

    try {
        const response = await fetch(`${BASE_URL}/api/test-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: '✨ Test Toast Notification',
                message: 'If you see this in the top-right corner, it works!',
                type: 'alert'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ In-app notification sent successfully!');
            console.log('   → Check your browser for a toast in the top-right corner');
            console.log('   → Check the notification bell badge');
        } else {
            console.log('❌ Failed to send notification:', data.error);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('   Make sure the dev server is running at', BASE_URL);
    }
}

async function testPushNotification() {
    console.log('\n📲 Testing Push Notification...\n');

    try {
        const response = await fetch(`${BASE_URL}/api/test-push`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Push notification sent!');
            console.log('   Result:', JSON.stringify(data.result, null, 2));

            if (data.result.results?.successCount > 0) {
                console.log('\n   🎉 SUCCESS! Check your browser for the push notification');
                console.log('   → Minimize/switch tabs to test background notifications');
            } else {
                console.log('\n   ⚠️  No devices received the notification');
                console.log('   → Make sure you granted notification permission');
                console.log('   → Visit /notification-debug to troubleshoot');
            }
        } else {
            console.log('❌ Failed:', data.error || 'Unknown error');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('   Make sure the dev server is running at', BASE_URL);
    }
}

async function checkDiagnostics() {
    console.log('\n🔍 Checking Notification Diagnostics...\n');
    console.log('Open this URL in your browser:');
    console.log(`   ${BASE_URL}/notification-debug\n`);
    console.log('Then click "Run Diagnostics" to check your setup.');
}

function showMenu() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('What would you like to test?');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Test In-App Toast Notification');
    console.log('2. Test Push Notification (Background)');
    console.log('3. Open Diagnostics Page');
    console.log('4. Test Everything');
    console.log('5. Exit');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function testEverything() {
    await testInAppNotification();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testPushNotification();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await checkDiagnostics();
}

async function handleChoice(choice) {
    switch (choice.trim()) {
        case '1':
            await testInAppNotification();
            break;
        case '2':
            await testPushNotification();
            break;
        case '3':
            await checkDiagnostics();
            break;
        case '4':
            await testEverything();
            break;
        case '5':
            console.log('\n👋 Goodbye!\n');
            rl.close();
            return false;
        default:
            console.log('❌ Invalid choice. Please enter 1-5.');
    }
    return true;
}

async function main() {
    console.log('Make sure your dev server is running at:', BASE_URL);
    console.log('If not, run: npm run dev\n');

    function askQuestion() {
        showMenu();
        rl.question('Enter your choice (1-5): ', async (answer) => {
            const shouldContinue = await handleChoice(answer);
            if (shouldContinue) {
                setTimeout(askQuestion, 100);
            }
        });
    }

    askQuestion();
}

// Handle Ctrl+C
rl.on('close', () => {
    console.log('\n👋 Exiting...\n');
    process.exit(0);
});

main();
