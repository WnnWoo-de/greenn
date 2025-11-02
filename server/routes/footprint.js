import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/footprint/calculate
// @desc    Calculate carbon footprint
// @access  Public (for testing)
router.post('/calculate', async (req, res) => {
  try {
    const { transport, energy, food, waste } = req.body;
    
    // Simple carbon footprint calculation
    let totalFootprint = 0;
    
    if (transport) {
      totalFootprint += (transport.car || 0) * 0.21; // kg CO2 per km
      totalFootprint += (transport.flight || 0) * 0.25; // kg CO2 per km
      totalFootprint += (transport.publicTransport || 0) * 0.05; // kg CO2 per km
    }
    
    if (energy) {
      totalFootprint += (energy.electricity || 0) * 0.5; // kg CO2 per kWh
      totalFootprint += (energy.gas || 0) * 2.0; // kg CO2 per cubic meter
    }
    
    if (food) {
      totalFootprint += (food.meat || 0) * 6.0; // kg CO2 per serving
      totalFootprint += (food.dairy || 0) * 3.0; // kg CO2 per serving
      totalFootprint += (food.vegetables || 0) * 0.5; // kg CO2 per serving
    }
    
    if (waste) {
      totalFootprint += (waste.general || 0) * 0.5; // kg CO2 per kg
    }

    res.json({
      totalFootprint: Math.round(totalFootprint * 100) / 100,
      breakdown: {
        transport: transport ? Math.round(((transport.car || 0) * 0.21 + (transport.flight || 0) * 0.25 + (transport.publicTransport || 0) * 0.05) * 100) / 100 : 0,
        energy: energy ? Math.round(((energy.electricity || 0) * 0.5 + (energy.gas || 0) * 2.0) * 100) / 100 : 0,
        food: food ? Math.round(((food.meat || 0) * 6.0 + (food.dairy || 0) * 3.0 + (food.vegetables || 0) * 0.5) * 100) / 100 : 0,
        waste: waste ? Math.round((waste.general || 0) * 0.5 * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Calculate footprint error:', error);
    res.status(500).json({
      error: 'Failed to calculate carbon footprint',
      message: error.message
    });
  }
});

export default router;