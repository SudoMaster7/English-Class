import mongoose from 'mongoose';

const shopItemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['avatar', 'theme', 'freeze', 'xp_boost', 'hint', 'cosmetic'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    icon: {
        type: String,
        default: '🎁'
    },
    rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    available: {
        type: Boolean,
        default: true
    },
    metadata: {
        // For XP boost: { multiplier: 2, duration: 3600 }
        // For freeze: { uses: 1 }
        // For avatar: { imageUrl: '...' }
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    stock: {
        type: Number,
        default: -1 // -1 = unlimited
    }
}, {
    timestamps: true
});

// Index for performance
shopItemSchema.index({ itemId: 1 }, { unique: true });
shopItemSchema.index({ type: 1 });
shopItemSchema.index({ available: 1 });

// Static method to seed initial shop items
shopItemSchema.statics.seedShopItems = async function () {
    const defaultItems = [
        {
            itemId: 'streak_freeze',
            name: 'Congelamento de Sequência',
            description: 'Protege sua sequência por 1 dia se você esquecer de praticar',
            type: 'freeze',
            price: 100,
            icon: '❄️',
            rarity: 'rare',
            metadata: { uses: 1 }
        },
        {
            itemId: 'xp_boost_1h',
            name: 'Boost de XP (1h)',
            description: 'Dobra o XP ganho por 1 hora',
            type: 'xp_boost',
            price: 50,
            icon: '⚡',
            rarity: 'common',
            metadata: { multiplier: 2, duration: 3600 }
        },
        {
            itemId: 'xp_boost_24h',
            name: 'Boost de XP (24h)',
            description: 'Dobra o XP ganho por 24 horas',
            type: 'xp_boost',
            price: 200,
            icon: '🚀',
            rarity: 'epic',
            metadata: { multiplier: 2, duration: 86400 }
        },
        {
            itemId: 'avatar_star',
            name: 'Avatar Estrela',
            description: 'Avatar personalizado de estrela brilhante',
            type: 'avatar',
            price: 150,
            icon: '⭐',
            rarity: 'rare',
            metadata: { imageUrl: '/assets/avatars/star.png' }
        },
        {
            itemId: 'avatar_trophy',
            name: 'Avatar Troféu',
            description: 'Avatar personalizado de troféu de campeão',
            type: 'avatar',
            price: 300,
            icon: '🏆',
            rarity: 'epic',
            metadata: { imageUrl: '/assets/avatars/trophy.png' }
        },
        {
            itemId: 'theme_dark',
            name: 'Tema Escuro',
            description: 'Ative o modo escuro premium',
            type: 'theme',
            price: 200,
            icon: '🌙',
            rarity: 'rare',
            metadata: { themeName: 'dark' }
        },
        {
            itemId: 'hint_pack',
            name: 'Pacote de Dicas (5x)',
            description: 'Receba 5 dicas para usar em exercícios difíceis',
            type: 'hint',
            price: 75,
            icon: '💡',
            rarity: 'common',
            metadata: { quantity: 5 }
        }
    ];

    for (const item of defaultItems) {
        await this.findOneAndUpdate(
            { itemId: item.itemId },
            item,
            { upsert: true, new: true }
        );
    }

    console.log('✅ Shop items seeded successfully');
};

const ShopItem = mongoose.model('ShopItem', shopItemSchema);

export default ShopItem;
