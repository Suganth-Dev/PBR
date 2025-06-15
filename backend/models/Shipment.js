import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  contractId: {
    type: String,
    required: true,
    index: true
  },
  batteriesShipped: {
    type: Number,
    required: true,
    min: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['APPROVED', 'BLOCKED', 'PENDING'],
    default: 'PENDING'
  },
  initiatedBy: {
    type: String,
    required: true
  },
  processedAt: {
    type: Date
  },
  blockReason: {
    type: String
  }
}, {
  timestamps: true
});

// Generate unique shipment ID
shipmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Shipment').countDocuments();
    this.shipmentId = `SHP-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient queries
shipmentSchema.index({ contractId: 1, timestamp: -1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ timestamp: -1 });

export default mongoose.model('Shipment', shipmentSchema);