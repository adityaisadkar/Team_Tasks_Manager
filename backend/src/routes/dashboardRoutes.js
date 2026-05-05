const express = require('express');
const router = express.Router();

const {
  getStats,
  getMyTasks,
  getOverdueTasks
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticate);

router.get('/stats', getStats);
router.get('/my-tasks', getMyTasks);
router.get('/overdue', getOverdueTasks);

module.exports = router;
