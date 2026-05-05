const express = require('express');
const router = express.Router();

const {
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, createTaskSchema, updateTaskSchema, updateTaskStatusSchema } = require('../utils/validators');

router.use(authenticate);

// ─── Task Routes by Project ───────────────────────────────────────────────
router.route('/project/:projectId')
  .get(getTasksByProject)
  .post(authorize('admin'), validate(createTaskSchema), createTask);

// ─── Individual Task Routes ───────────────────────────────────────────────
router.route('/:id')
  .get(getTaskById)
  .put(validate(updateTaskSchema), updateTask)
  .delete(authorize('admin'), deleteTask);

router.patch('/:id/status', validate(updateTaskStatusSchema), updateTaskStatus);

module.exports = router;
