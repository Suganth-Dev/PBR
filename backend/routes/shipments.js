import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Shipment from '../models/Shipment.js';
import Contract from '../models/Contract.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// @route   GET /api/shipments
// @desc    Get all shipments
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status, contractId } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (contractId) query.contractId = contractId;

  const shipments = await Shipment.find(query)
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Shipment.countDocuments(query);

  res.json({
    success: true,
    data: shipments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @route   POST /api/shipments
// @desc    Create new shipment (with atomic validation)
// @access  Private
router.post('/', [
  body('contractId').notEmpty().trim(),
  body('batteriesShipped').isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { contractId, batteriesShipped } = req.body;
  const initiatedBy = req.user.email || 'system';

  // Start MongoDB session for atomic operations
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Find and lock the contract
      const contract = await Contract.findOne({ contractId }).session(session);
      
      if (!contract) {
        throw new Error('Contract not found');
      }

      // Check if contract is already locked
      if (contract.isLocked) {
        throw new Error('Contract is locked - shipments blocked');
      }

      // Calculate new total
      const newTotal = contract.batteriesShipped + batteriesShipped;
      
      // Create shipment record
      const shipment = new Shipment({
        contractId,
        batteriesShipped,
        initiatedBy,
        timestamp: new Date()
      });

      // Determine shipment status and update contract
      if (newTotal > contract.threshold) {
        // Block the shipment
        shipment.status = 'BLOCKED';
        shipment.blockReason = 'Exceeds contract threshold';
        shipment.processedAt = new Date();
        
        // Lock the contract
        contract.isLocked = true;
        
        // Add notification
        contract.notificationsSent.push({
          email: 'stakeholder@company.com',
          timestamp: new Date(),
          message: `Contract limit exceeded - shipment blocked (${newTotal}/${contract.threshold})`
        });

        // Send email notification
        try {
          await sendNotificationEmail({
            to: 'stakeholder@company.com',
            subject: `⚠️ PBR Battery Shipment Limit Exceeded (Contract: ${contractId})`,
            contractId,
            deviceCount: contract.deviceCount,
            batteriesShipped: newTotal,
            threshold: contract.threshold,
            action: 'BLOCKED'
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      } else {
        // Approve the shipment
        shipment.status = 'APPROVED';
        shipment.processedAt = new Date();
        
        // Update contract batteries shipped
        contract.batteriesShipped = newTotal;
        
        // Check if we're approaching the threshold (80%)
        const percentage = (newTotal / contract.threshold) * 100;
        if (percentage >= 80 && percentage < 100) {
          contract.notificationsSent.push({
            email: 'stakeholder@company.com',
            timestamp: new Date(),
            message: `Warning: 80% threshold reached (${newTotal}/${contract.threshold})`
          });

          // Send warning email
          try {
            await sendNotificationEmail({
              to: 'stakeholder@company.com',
              subject: `⚠️ PBR Battery Shipment Warning (Contract: ${contractId})`,
              contractId,
              deviceCount: contract.deviceCount,
              batteriesShipped: newTotal,
              threshold: contract.threshold,
              action: 'WARNING'
            });
          } catch (emailError) {
            console.error('Failed to send warning email:', emailError);
          }
        }
      }

      // Save both documents
      await shipment.save({ session });
      await contract.save({ session });

      // Emit real-time updates
      const io = req.app.get('io');
      io.emit('shipmentCreated', shipment);
      io.emit('contractUpdated', contract);

      res.status(201).json({
        success: true,
        message: `Shipment ${shipment.status.toLowerCase()} successfully`,
        data: shipment
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process shipment'
    });
  } finally {
    await session.endSession();
  }
}));

// @route   GET /api/shipments/:id
// @desc    Get shipment by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  
  if (!shipment) {
    return res.status(404).json({
      success: false,
      message: 'Shipment not found'
    });
  }

  res.json({
    success: true,
    data: shipment
  });
}));

// @route   GET /api/shipments/contract/:contractId
// @desc    Get shipments by contract ID
// @access  Private
router.get('/contract/:contractId', asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const shipments = await Shipment.find({ contractId })
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Shipment.countDocuments({ contractId });

  res.json({
    success: true,
    data: shipments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

export default router;