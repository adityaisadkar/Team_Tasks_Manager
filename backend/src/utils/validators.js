const { z } = require('zod');

// ─── Auth Schemas ──────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long'),
  role: z.enum(['admin', 'member']).optional().default('member'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email')
    .toLowerCase()
    .trim(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

// ─── Project Schemas ───────────────────────────────────────────────────────

const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  description: z.string().max(500, 'Description too long').trim().optional().default(''),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code')
    .optional()
    .default('#6366f1'),
});

const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['active', 'archived']).optional(),
});

// ─── Task Schemas ──────────────────────────────────────────────────────────

const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .min(2, 'Title must be at least 2 characters')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  description: z.string().max(2000, 'Description too long').trim().optional().default(''),
  assignedTo: z.string().optional().nullable(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

const updateTaskSchema = createTaskSchema.partial();

const updateTaskStatusSchema = z.object({
  status: z.enum(['todo', 'in-progress', 'review', 'done'], {
    required_error: 'Status is required',
  }),
});

// ─── Validator Middleware Factory ─────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * On failure, returns 400 with structured error messages.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Replace body with parsed (and coerced) data
  req.body = result.data;
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
};
