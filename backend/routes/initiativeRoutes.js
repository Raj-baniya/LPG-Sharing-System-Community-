const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const initiativeController = require('../controllers/initiativeController');

const router = express.Router();

router.get('/', initiativeController.listInitiatives);
router.get('/offers', initiativeController.listOffers);
router.get('/offers/mine', protect, requireRole(['provider']), initiativeController.listMyOffers);
router.post('/offers', protect, requireRole(['provider']), initiativeController.createOffer);

module.exports = router;
