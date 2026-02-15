import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        itemId: {
            type: String,
            required: true
        },
        itemType: {
            type: String,
            enum: ['avatar', 'theme', 'freeze', 'xp_boost', 'hint', 'cosmetic'],
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 0
        },
        purchasedAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            default: null
        },
        active: {
            type: Boolean,
            default: false
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    }],
    activeBoosts: [{
        itemId: String,
        type: String,
        multiplier: Number,
        activatedAt: Date,
        expiresAt: Date
    }]
}, {
    timestamps: true
});

// Index for performance
inventorySchema.index({ userId: 1 }, { unique: true });
inventorySchema.index({ 'items.itemId': 1 });
inventorySchema.index({ 'activeBoosts.expiresAt': 1 });

// Method to add item to inventory
inventorySchema.methods.addItem = function (itemId, itemType, quantity = 1, metadata = {}) {
    const existingItem = this.items.find(item => item.itemId === itemId);

    if (existingItem) {
        // For consumables, increase quantity
        if (['freeze', 'hint', 'xp_boost'].includes(itemType)) {
            existingItem.quantity += quantity;
        }
    } else {
        // Add new item
        this.items.push({
            itemId,
            itemType,
            quantity,
            metadata,
            purchasedAt: new Date()
        });
    }

    return this;
};

// Method to use/consume an item
inventorySchema.methods.useItem = function (itemId) {
    const item = this.items.find(i => i.itemId === itemId);

    if (!item) {
        throw new Error('Item not found in inventory');
    }

    if (item.quantity <= 0) {
        throw new Error('No uses remaining for this item');
    }

    // Handle different item types
    if (item.itemType === 'freeze') {
        // Decrease quantity for consumables
        item.quantity -= 1;
        return { type: 'freeze', used: true };
    }

    if (item.itemType === 'xp_boost') {
        item.quantity -= 1;

        // Activate boost
        const boostDuration = item.metadata.duration || 3600; // Default 1 hour
        const multiplier = item.metadata.multiplier || 2;

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + boostDuration);

        this.activeBoosts.push({
            itemId,
            type: 'xp_boost',
            multiplier,
            activatedAt: new Date(),
            expiresAt
        });

        return { type: 'xp_boost', multiplier, expiresAt };
    }

    if (item.itemType === 'hint') {
        item.quantity -= 1;
        return { type: 'hint', used: true };
    }

    throw new Error('Item type cannot be used');
};

// Method to equip cosmetic item
inventorySchema.methods.equipItem = function (itemId) {
    const item = this.items.find(i => i.itemId === itemId);

    if (!item) {
        throw new Error('Item not found in inventory');
    }

    if (!['avatar', 'theme', 'cosmetic'].includes(item.itemType)) {
        throw new Error('Only cosmetic items can be equipped');
    }

    // Unequip all items of the same type
    this.items.forEach(i => {
        if (i.itemType === item.itemType) {
            i.active = false;
        }
    });

    // Equip the selected item
    item.active = true;

    return item;
};

// Method to get active XP multiplier
inventorySchema.methods.getActiveXPMultiplier = function () {
    // Clean up expired boosts
    this.activeBoosts = this.activeBoosts.filter(boost => {
        return boost.expiresAt > new Date();
    });

    // Get highest multiplier
    let maxMultiplier = 1;
    this.activeBoosts.forEach(boost => {
        if (boost.type === 'xp_boost' && boost.multiplier > maxMultiplier) {
            maxMultiplier = boost.multiplier;
        }
    });

    return maxMultiplier;
};

// Method to check if has item
inventorySchema.methods.hasItem = function (itemId) {
    const item = this.items.find(i => i.itemId === itemId && i.quantity > 0);
    return !!item;
};

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
