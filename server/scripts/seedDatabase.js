import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import User from '../models/User.js'; // Import first
import ShopItem from '../models/ShopItem.js';
import Leaderboard from '../models/Leaderboard.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log('🌱 Starting database seeding...\n');

        // Seed shop items
        console.log('🛒 Seeding shop items...');
        await ShopItem.seedShopItems();

        // Initialize leaderboards
        console.log('🏆 Initializing leaderboards...');
        await Leaderboard.rebuildLeaderboard('global', 'all-time');

        const now = new Date();
        const year = now.getFullYear();
        const week = getWeekNumber(now);
        const period = `${year}-W${week.toString().padStart(2, '0')}`;
        await Leaderboard.rebuildLeaderboard('weekly', period);

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\nSeeded items:');
        console.log('  - Shop items: 7 items');
        console.log('  - Leaderboards: Global + Weekly');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Helper function to get ISO week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

seedDatabase();
