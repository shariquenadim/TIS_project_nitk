const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  costPerTablet: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  tabletsInStock: { type: Number, required: true },
});

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;