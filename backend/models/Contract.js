import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
    required: true
  }
});

const contractSchema = new mongoose.Schema({
  contractId: {
    type: String,
    required: true,
    unique: true,  // ✅ This automatically indexes the field
    index: true
  },
  deviceCount: {
    type: Number,
    required: true,
    min: 1
  },
  batteriesShipped: {
    type: Number,
    default: 0,
    min: 0
  },
  threshold: {
    type: Number,
    required: true,
    min: 1
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notificationsSent: [notificationSchema]
}, {
  timestamps: true
});

// Middleware to update lastUpdated on save
contractSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Calculate threshold automatically based on device count
contractSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('deviceCount')) {
    this.threshold = Math.ceil(this.deviceCount * 1.2); // 20% buffer
  }
  next();
});

// ✅ Keep other useful indexes
contractSchema.index({ isLocked: 1 });
contractSchema.index({ lastUpdated: -1 });

export default mongoose.model('Contract', contractSchema);
