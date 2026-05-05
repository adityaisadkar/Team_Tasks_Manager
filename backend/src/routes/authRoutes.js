const express = require('express');
const router = express.Router();

const { register, login, getMe, updateProfile, changePassword, getAllUsers } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../utils/validators');

// ─── Public Routes ────────────────────────────────────────────────────────
// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// ─── Protected Routes (require valid JWT) ─────────────────────────────────
// GET /api/auth/me
router.get('/me', authenticate, getMe);

// GET /api/auth/users (Admin only)
router.get('/users', authenticate, authorize('admin'), getAllUsers);

// PUT /api/auth/update-profile
router.put('/update-profile', authenticate, updateProfile);

// PUT /api/auth/change-password
router.put('/change-password', authenticate, changePassword);

module.exports = router;
