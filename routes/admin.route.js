const User = require('../models/user.model');
const Inventory = require('../models/inventory.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    // res.send(users);
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
      return;
    }
    const person = await User.findById(id);
    res.render('profile', { person });
  } catch (error) {
    next(error);
  }
});

router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;

    // Checking for id and roles in req.body
    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id) {
      req.flash(
        'error',
        'Admins cannot remove themselves from Admin, ask another admin.'
      );
      return res.redirect('back');
    }

    // Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    req.flash('info', `updated role for ${user.email} to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

router.get('/inventory', async (req, res, next) => {
  try {
    const inventory = await Inventory.find();
    res.render('inventory', { inventory });
  } catch (error) {
    next(error);
  }
});

router.post('/add-medicine', async (req, res, next) => {
  try {
    const { medicineName, costPerTablet, expirationDate, tabletsInStock } = req.body;
    const user = req.user;

    if (!medicineName || !costPerTablet || !expirationDate || !tabletsInStock) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/admin/inventory');
    }

    // Parse the expiration date to create a Date object
    const [month, year] = expirationDate.split('/');
    const expirationDateObj = new Date(`${year}-${month}-01`);

    // Adding the medicine to the inventory
    const newMedicine = new Inventory({
      medicineName,
      costPerTablet,
      expirationDate: expirationDateObj,
      tabletsInStock,
    });

    // Saving data
    await newMedicine.save();

    req.flash('success', 'Medicine added successfully.');
    res.redirect('/admin/inventory');
  } catch (error) {
    next(error);
  }
});

router.post('/remove-medicine/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check for valid mongoose object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid ID.');
      return res.redirect('/admin/inventory');
    }

    // Use the Inventory model to find the medicine by ID
    const inventoryItem = await Inventory.findById(id);

    // Check if the Inventory document exists
    if (!inventoryItem) {
      req.flash('error', 'Inventory item not found.');
      return res.redirect('/admin/inventory');
    }

    // Remove the medicine from the inventory
    await Inventory.findByIdAndRemove(id);

    req.flash('success', 'Medicine removed successfully.');
    res.redirect('/admin/inventory');
  } catch (error) {
    console.error('Error in remove-medicine route:', error);
    next(error);
  }
});

router.post('/update-medicine/:id', async (req, res, next) => {
  console.log('Request Body:', req.body);
  try {
    const { id } = req.params;

    // Check for valid mongoose object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid ID.');
      return res.redirect('/admin/inventory');
    }

    // Find the Inventory document by ID
    const inventoryItem = await Inventory.findById(id);

    // Check if the Inventory document exists
    if (!inventoryItem) {
      req.flash('error', 'Inventory item not found.');
      return res.redirect('/admin/inventory');
    }

    // Extract the fields from the request body
    const { medicineName, costPerTablet, expirationDate, tabletsInStock } = req.body;

    // Update only the provided fields, keeping existing values for others
    if (medicineName) {
      inventoryItem.medicineName = medicineName;
    }
    if (costPerTablet) {
      inventoryItem.costPerTablet = parseFloat(costPerTablet);
    }
    if (expirationDate) {
      inventoryItem.expirationDate = new Date(expirationDate);
    }
    if (tabletsInStock) {
      inventoryItem.tabletsInStock = parseInt(tabletsInStock, 10);
    }

    // Save the updated Inventory document
    await inventoryItem.save();

    req.flash('success', 'Medicine updated successfully.');
    res.redirect('/admin/inventory');
  } catch (error) {
    next(error);
  }
});


module.exports = router;
