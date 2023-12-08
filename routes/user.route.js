const router = require('express').Router();

router.get('/profile', async (req, res, next) => {
  // console.log(req.user);
  const person = req.user;
  res.render('profile', { person });
});

router.get('/epharma', async (req, res, next) => {
  res.render('epharma'); 
});

module.exports = router;
