const BrokerageData = require('../models/brokerageData'); // Import the model
const logger = require('../logger'); // Import logger

// Helper function to validate nested fields
const validateNestedFields = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (value && typeof value !== 'object') {
      return key; // Return the invalid field name
    }
  }
  return null; // All fields are valid
};

// Add brokerage data
exports.addBrokerageData = async (req, res) => {
  const {
    scheme,
    gst,
    payout,
    tenures,
    monthly_aum_tenures,
    quarterly_aum_tenures,
    volume_incentives,
    trail_income,
    brokerage_rates,
  } = req.body;

  // Validate required fields
  if (!scheme || !gst) {
    return res.status(400).json({ error: 'Scheme and GST are required' });
  }

  try {
    // Check if the scheme already exists
    const existingScheme = await BrokerageData.findOne({ scheme });
    if (existingScheme) {
      return res.status(409).json({ error: `Scheme '${scheme}' already exists` });
    }

    // Validate nested objects (if present)
    const invalidField = validateNestedFields({
      tenures,
      monthly_aum_tenures,
      quarterly_aum_tenures,
      volume_incentives,
      trail_income,
      brokerage_rates,
    });
    if (invalidField) {
      return res.status(400).json({ error: `Invalid data for field: ${invalidField}` });
    }

    // Create a new brokerage data entry
    const newBrokerageData = new BrokerageData({
      scheme,
      gst,
      payout,
      tenures,
      monthly_aum_tenures,
      quarterloggerly_aum_tenures,
      volume_incentives,
      trail_income,
      brokerage_rates,
    });

    // Save to the database
    await newBrokerageData.save();

    // Return success response
    res.status(201).json({
      message: 'Brokerage data added successfully',
      data: newBrokerageData,
    });
    logger.info(`Brokerage data added for scheme: ${scheme}`);
  } catch (err) {
    logger.error(`Error adding brokerage data: ${err.message}`);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: err.message });
    }
    res.status(500).json({ error: 'Failed to add brokerage data' });
  }
};

// Calculate commission
exports.calculateCommission = async (req, res) => {
  const { scheme, tenureKey, amount } = req.body;

  if (!scheme || !tenureKey || !amount) {
    return res.status(400).json({ error: 'Scheme, tenureKey, and amount are required' });
  }

  try {
    const brokerage = await BrokerageData.findOne({ scheme });

    if (!brokerage) {
      return res.status(404).json({ error: `Scheme '${scheme}' not found` });
    }

    // Determine which field (tenures, monthly_aum_tenures, etc.) contains the tenureKey
    const commissionRate =
      brokerage.tenures?.[tenureKey] ||
      brokerage.monthly_aum_tenures?.[tenureKey] ||
      brokerage.quarterly_aum_tenures?.[tenureKey];

    if (!commissionRate) {
      return res.status(404).json({ error: `No matching tenure found for scheme '${scheme}'` });
    }

    // Calculate earnings
    const earnings = (amount * commissionRate) / 100;

    res.json({
      scheme,
      tenureKey,
      amount,
      commissionRate,
      earnings,
    });
    logger.info(`Commission calculated for scheme: ${scheme}, tenureKey: ${tenureKey}`);
  } catch (err) {
    logger.error(`Error calculating commission: ${err.message}`);
    res.status(500).json({ error: 'Failed to calculate commission' });
  }
};

// Get all brokerage data
exports.getBrokerageData = async (req, res) => {
  try {
    const brokerageData = await BrokerageData.find();
    res.json({ data: brokerageData });
    logger.info('Fetched all brokerage data');
  } catch (err) {
    logger.error(`Error fetching brokerage data: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch brokerage data' });
  }
};

// Get tenures and scheme-specific data for a specific scheme
exports.getTenuresByScheme = async (req, res) => {
  const { scheme } = req.params;

  try {
    logger.info(`Fetching scheme data and tenures for: ${scheme}`);

    // Find the brokerage data for the given scheme
    const brokerage = await BrokerageData.findOne({ scheme });

    if (!brokerage) {
      return res.status(404).json({ error: `Scheme '${scheme}' not found in the database` });
    }

    // Combine all the tenures fields (tenures, monthly_aum_tenures, quarterly_aum_tenures)
    const tenures = {
      ...brokerage.tenures?.toObject(),
      ...brokerage.monthly_aum_tenures?.toObject(),
      ...brokerage.quarterly_aum_tenures?.toObject(),
    };

    // If no tenures found
    if (Object.keys(tenures).length === 0) {
      return res.status(404).json({ error: `No tenures found for scheme '${scheme}'` });
    }

    // Prepare data for response
    const schemeData = {
      scheme: brokerage.scheme,
      gst: brokerage.gst,
      payout: brokerage.payout,
      tenures: tenures,
      volume_incentives: brokerage.volume_incentives || {},
      trail_income: brokerage.trail_income || {},
    };

    logger.info(`Fetched data for scheme: ${scheme}`);
    res.json(schemeData);
  } catch (err) {
    logger.error(`Error fetching scheme data: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch scheme data' });
  }
};

// Update brokerage data
exports.updateBrokerageData = async (req, res) => {
  const { scheme } = req.params;
  const updateFields = req.body;

  try {
    const updatedBrokerageData = await BrokerageData.findOneAndUpdate(
      { scheme },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedBrokerageData) {
      return res.status(404).json({ error: `Scheme '${scheme}' not found` });
    }

    res.json({ message: 'Brokerage data updated successfully', data: updatedBrokerageData });
    logger.info(`Brokerage data updated for scheme: ${scheme}`);
  } catch (err) {
    logger.error(`Error updating brokerage data: ${err.message}`);
    res.status(500).json({ error: 'Failed to update brokerage data' });
  }
};

exports.getBrokerageByScheme = async (req, res) => {
  const { scheme } = req.params;
  console.log(`Fetching data for scheme: ${scheme}`); // Debugging log
  try {
      const brokerage = await BrokerageData.findOne({ scheme });
      if (!brokerage) {
          return res.status(404).json({ error: `Scheme '${scheme}' not found` });
      }
      res.json({ data: brokerage });
  } catch (err) {
      console.error('Error fetching scheme:', err);
      res.status(500).json({ error: 'Failed to fetch scheme' });
  }
};