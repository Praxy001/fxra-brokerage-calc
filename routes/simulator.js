// routes/simulator.js
// In your routes/simulator.js
const express = require('express');
const router = express.Router();
const simulatorController = require('../controllers/simulatorController');


router.get('/:scheme', simulatorController.getBrokerageByScheme);
router.post('/calculate', simulatorController.calculateCommission);  // POST request handler




/**
 * Add new brokerage data
 * Endpoint: POST /simulator/add
 * Request Body: { scheme, gst, payout, tenures, ... }
 * Response: Success message and the added data
 */
router.post('/add', simulatorController.addBrokerageData);

/**
 * Calculate commission for a given scheme and tenure
 * Endpoint: POST /simulator/calculate
 * Request Body: { scheme, tenureKey, amount }
 * Response: Calculated commission details
 */
router.post('/calculate', simulatorController.calculateCommission);

/**
 * Get tenures for a specific scheme
 * Endpoint: GET /simulator/tenures/:scheme
 * Path Param: scheme (e.g., "Shriram Finance Limited")
 * Response: Tenures associated with the scheme
 */
router.get('/tenures/:scheme', simulatorController.getTenuresByScheme);

/**
 * Get all brokerage data
 * Endpoint: GET /simulator/all
 * Response: List of all brokerage data
 */
router.get('/all', simulatorController.getBrokerageData);

/**
 * Get a specific brokerage scheme by its name
 * Endpoint: GET /simulator/:scheme
 * Path Param: scheme (e.g., "Shriram Finance Limited")
 * Response: Details of the specified scheme
 */
router.get('/:scheme', simulatorController.getBrokerageByScheme);

/**
 * Update brokerage data for a specific scheme
 * Endpoint: PUT /simulator/:scheme
 * Path Param: scheme (e.g., "Shriram Finance Limited")
 * Request Body: { tenures, monthly_aum_tenures, ... }
 * Response: Updated scheme data
 */
router.put('/:scheme', simulatorController.updateBrokerageData);

/**
 * Fallback for unmatched routes in this module
 * Should be the last route to handle all unmatched paths
 */
router.use((req, res) => {
  res.status(404).json({ error: 'Route not found in /simulator' });
});

module.exports = router;
