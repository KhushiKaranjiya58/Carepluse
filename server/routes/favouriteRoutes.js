/**
 * Favourite Routes (spec alias)
 * Mounted at /api/patients — mirrors /api/patient/favourites/*
 */

const express = require('express');
const router = express.Router();
const {
  getFavourites,
  addFavourite,
  removeFavourite,
} = require('../controllers/favouriteController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

router.use(verifyToken, checkRole('patient'));

router.get('/favourites', getFavourites);
router.post('/favourites/add', addFavourite);
router.delete('/favourites/remove', removeFavourite);

module.exports = router;
