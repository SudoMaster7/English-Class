import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import ShopItem from '../models/ShopItem.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';

const router = express.Router();

// ========================================
// Get all shop items
// ========================================
router.get('/items', async (req, res) => {
    try {
        const items = await ShopItem.find({ available: true }).sort({ price: 1 });

        res.json({
            success: true,
            data: {
                items
            }
        });
    } catch (error) {
        console.error('Get shop items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve shop items'
        });
    }
});

// ========================================
// Purchase item
// ========================================
router.post('/purchase/:itemId', authenticate, async (req, res) => {
    try {
        const { itemId } = req.params;

        const item = await ShopItem.findOne({ itemId, available: true });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found or unavailable'
            });
        }

        // Check stock
        if (item.stock !== -1 && item.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Item out of stock'
            });
        }

        // Get user
        const user = await User.findById(req.user.id);

        // Check if user has enough coins
        if (user.profile.coins < item.price) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient coins',
                required: item.price,
                current: user.profile.coins
            });
        }

        // Deduct coins
        user.profile.coins -= item.price;

        // Handle specific item type effects
        if (item.type === 'freeze') {
            user.profile.freezesAvailable += (item.metadata.uses || 1);
        }

        await user.save();

        // Add to inventory
        let inventory = await Inventory.findOne({ userId: req.user.id });

        if (!inventory) {
            inventory = new Inventory({ userId: req.user.id, items: [] });
        }

        inventory.addItem(item.itemId, item.type, 1, item.metadata);
        await inventory.save();

        // Update stock if limited
        if (item.stock !== -1) {
            item.stock -= 1;
            await item.save();
        }

        res.json({
            success: true,
            data: {
                item,
                newCoins: user.profile.coins,
                inventory: inventory.items.find(i => i.itemId === itemId)
            }
        });
    } catch (error) {
        console.error('Purchase item error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to purchase item'
        });
    }
});

// ========================================
// Get user's inventory
// ========================================
router.get('/inventory', authenticate, async (req, res) => {
    try {
        let inventory = await Inventory.findOne({ userId: req.user.id });

        if (!inventory) {
            inventory = new Inventory({ userId: req.user.id, items: [] });
            await inventory.save();
        }

        res.json({
            success: true,
            data: {
                items: inventory.items,
                activeBoosts: inventory.activeBoosts
            }
        });
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve inventory'
        });
    }
});

// ========================================
// Equip cosmetic item (avatar/theme)
// ========================================
router.post('/equip/:itemId', authenticate, async (req, res) => {
    try {
        const { itemId } = req.params;

        const inventory = await Inventory.findOne({ userId: req.user.id });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'No inventory found'
            });
        }

        const equippedItem = inventory.equipItem(itemId);
        await inventory.save();

        // Update user profile if avatar
        if (equippedItem.itemType === 'avatar' && equippedItem.metadata.imageUrl) {
            const user = await User.findById(req.user.id);
            user.profile.avatar = equippedItem.metadata.imageUrl;
            await user.save();
        }

        res.json({
            success: true,
            data: {
                item: equippedItem,
                inventory: inventory.items
            }
        });
    } catch (error) {
        console.error('Equip item error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to equip item'
        });
    }
});

// ========================================
// Use consumable item (boost/freeze/hint)
// ========================================
router.post('/use/:itemId', authenticate, async (req, res) => {
    try {
        const { itemId } = req.params;

        const inventory = await Inventory.findOne({ userId: req.user.id });

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'No inventory found'
            });
        }

        const result = inventory.useItem(itemId);
        await inventory.save();

        res.json({
            success: true,
            data: {
                result,
                inventory: inventory.items,
                activeBoosts: inventory.activeBoosts
            }
        });
    } catch (error) {
        console.error('Use item error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to use item'
        });
    }
});

export default router;
