import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock shop items
const shopItems = [
  {
    id: '1',
    name: '环保购物袋',
    description: '可重复使用的环保购物袋',
    price: 100,
    category: 'accessories',
    image: '/images/eco-bag.jpg',
    inStock: true
  },
  {
    id: '2',
    name: '竹制牙刷',
    description: '100%可生物降解的竹制牙刷',
    price: 50,
    category: 'personal-care',
    image: '/images/bamboo-toothbrush.jpg',
    inStock: true
  },
  {
    id: '3',
    name: '太阳能充电器',
    description: '便携式太阳能手机充电器',
    price: 500,
    category: 'electronics',
    image: '/images/solar-charger.jpg',
    inStock: true
  }
];

// @route   GET /api/shop/items
// @desc    Get shop items
// @access  Public
router.get('/items', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let filteredItems = shopItems;
    
    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    if (search) {
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ items: filteredItems });
  } catch (error) {
    console.error('Get shop items error:', error);
    res.status(500).json({
      error: 'Failed to get shop items',
      message: error.message
    });
  }
});

// @route   POST /api/shop/purchase
// @desc    Purchase item with points
// @access  Private
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    
    const item = shopItems.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        error: 'Item not found'
      });
    }
    
    if (!item.inStock) {
      return res.status(400).json({
        error: 'Item out of stock'
      });
    }
    
    const totalCost = item.price * quantity;
    
    if (req.user.points < totalCost) {
      return res.status(400).json({
        error: 'Insufficient points',
        required: totalCost,
        available: req.user.points
      });
    }
    
    // Deduct points (in a real app, you'd update the database)
    res.json({
      message: 'Purchase successful',
      item: item.name,
      quantity,
      pointsSpent: totalCost,
      remainingPoints: req.user.points - totalCost
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      error: 'Failed to process purchase',
      message: error.message
    });
  }
});

export default router;