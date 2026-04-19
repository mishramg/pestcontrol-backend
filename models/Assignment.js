const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  customerName: { type: String, required: true },
  contactNumber: { type: String, required: true }, // Add this line
  address: { type: String, required: true },
  technicianName: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);