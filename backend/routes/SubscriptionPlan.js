const express = require('express');
const router = express.Router();
const SubscriptionPlanController = require('../controllers/SubscriptionPlanController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.get('/get-all-plans', verifyToken, checkRole(['admin']), SubscriptionPlanController.getAllPlans);
router.get('/get-plan-by-id/:planId', verifyToken, SubscriptionPlanController.getPlanById);
router.post('/create-plan', verifyToken, checkRole(['admin']), SubscriptionPlanController.createPlan);
router.put('/update-plan/:id', verifyToken, checkRole(['admin']), SubscriptionPlanController.updatePlan);
router.put('/disable-plan/:id', verifyToken, checkRole(['admin']), SubscriptionPlanController.disablePlan);
router.get('/get-plan-by-type', SubscriptionPlanController.getPlanByType);

module.exports = router;