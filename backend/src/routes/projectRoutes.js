const express = require('express');
const router = express.Router();

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, createProjectSchema, updateProjectSchema } = require('../utils/validators');

// All project routes require authentication
router.use(authenticate);

// ─── Project Member Routes (Read-only for members) ────────────────────────
router.route('/')
  .get(getProjects)
  .post(authorize('admin'), validate(createProjectSchema), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(authorize('admin'), validate(updateProjectSchema), updateProject)
  .delete(authorize('admin'), deleteProject);

// ─── Project Membership Routes (Admin only) ───────────────────────────────
router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
