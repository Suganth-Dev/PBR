import express from 'express';
import { body, validationResult } from 'express-validator';
import Contract from '../models/Contract.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/contracts
// @desc    Get all contracts
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const contracts = await Contract.find()
    .sort({ lastUpdated: -1 });

  res.json({
    success: true,
    data: contracts
  });
}));

// @route   GET /api/contracts/:id
// @desc    Get contract by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  
  if (!contract) {
    return res.status(404).json({
      success: false,
      message: 'Contract not found'
    });
  }

  res.json({
    success: true,
    data: contract
  });
}));

// @route   POST /api/contracts
// @desc    Create new contract
// @access  Private (Admin only)
router.post('/', requireAdmin, [
  body('contractId').notEmpty().trim(),
  body('deviceCount').isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { contractId, deviceCount } = req.body;

  // Check if contract already exists
  const existingContract = await Contract.findOne({ contractId });
  if (existingContract) {
    return res.status(400).json({
      success: false,
      message: 'Contract with this ID already exists'
    });
  }

  const contract = new Contract({
    contractId,
    deviceCount,
    threshold: Math.ceil(deviceCount * 1.2) // 20% buffer
  });

  await contract.save();

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('contractCreated', contract);

  res.status(201).json({
    success: true,
    message: 'Contract created successfully',
    data: contract
  });
}));

// @route   PATCH /api/contracts/:id/toggle-lock
// @desc    Toggle contract lock status
// @access  Private (Admin only)
router.patch('/:id/toggle-lock', requireAdmin, asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  
  if (!contract) {
    return res.status(404).json({
      success: false,
      message: 'Contract not found'
    });
  }

  contract.isLocked = !contract.isLocked;
  await contract.save();

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('contractUpdated', contract);

  res.json({
    success: true,
    message: `Contract ${contract.isLocked ? 'locked' : 'unlocked'} successfully`,
    data: contract
  });
}));

// @route   PUT /api/contracts/:id
// @desc    Update contract
// @access  Private (Admin only)
router.put('/:id', requireAdmin, [
  body('deviceCount').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const contract = await Contract.findById(req.params.id);
  
  if (!contract) {
    return res.status(404).json({
      success: false,
      message: 'Contract not found'
    });
  }

  const { deviceCount } = req.body;
  
  if (deviceCount) {
    contract.deviceCount = deviceCount;
    contract.threshold = Math.ceil(deviceCount * 1.2);
  }

  await contract.save();

  // Emit real-time update
  const io = req.app.get('io');
  io.emit('contractUpdated', contract);

  res.json({
    success: true,
    message: 'Contract updated successfully',
    data: contract
  });
}));

// @route   DELETE /api/contracts/:id
// @desc    Delete contract
// @access  Private (Admin only)
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  
  if (!contract) {
    return res.status(404).json({
      success: false,
      message: 'Contract not found'
    });
  }

  await contract.deleteOne();

  res.json({
    success: true,
    message: 'Contract deleted successfully'
  });
}));

export default router;