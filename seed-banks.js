const { seedBanks } = require('./lib/actions/bank.actions');

console.log("Starting seed process...");
seedBanks()
    .then(() => {
        console.log("Seeding complete.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Seeding failed:", err);
        process.exit(1);
    });
