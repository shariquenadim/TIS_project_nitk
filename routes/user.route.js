const router = require('express').Router();
const Inventory = require('../models/inventory.model');

router.get('/profile', async (req, res, next) => {
  // console.log(req.user);
  const person = req.user;
  res.render('profile', { person });
});

router.get('/epharma', async (req, res, next) => {
  try {
    const inventory = await Inventory.find();
    res.render('epharma', { inventory });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
