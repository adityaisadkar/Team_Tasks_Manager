const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendSuccess, sendError } = require('../utils/helpers');

// ─── GET /api/tasks/project/:projectId ────────────────────────────────────
// Members of the project can get tasks
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) return sendError(res, 404, 'Project not found');

    if (req.user.role !== 'admin' && !project.members.includes(req.user._id)) {
      return sendError(res, 403, 'Access denied to this project\'s tasks');
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/tasks/project/:projectId ───────────────────────────────────
// Admin only
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, status, priority, dueDate, tags } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) return sendError(res, 404, 'Project not found');

    // If assignedTo is provided, verify they are a member of the project
    if (assignedTo && !project.members.includes(assignedTo)) {
        return sendError(res, 400, 'Assigned user is not a member of this project');
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status,
      priority,
      dueDate,
      tags,
    });

    return sendSuccess(res, 201, 'Task created successfully', task);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────
// Members of the task's project can get details
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name members')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) return sendError(res, 404, 'Task not found');

    // Check project access
    if (req.user.role !== 'admin' && !task.project.members.includes(req.user._id)) {
      return sendError(res, 403, 'Access denied to this task');
    }

    return sendSuccess(res, 200, 'Task retrieved successfully', task);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────
// Admin can update anything. Assignee can update anything (optional: limit assignee to status/progress if strictly needed, but let's allow general update for simplicity in small teams).
const updateTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate, tags } = req.body;

    const task = await Task.findById(req.params.id).populate('project', 'members');
    if (!task) return sendError(res, 404, 'Task not found');

    // Authorization
    const isAssignee = task.assignedTo && task.assignedTo.equals(req.user._id);
    if (req.user.role !== 'admin' && !isAssignee) {
        return sendError(res, 403, 'Only admins or the assigned user can update this task');
    }
    
    // If assignedTo changes, verify new user is project member
    if (assignedTo && assignedTo !== String(task.assignedTo)) {
        if (!task.project.members.includes(assignedTo)) {
             return sendError(res, 400, 'Assigned user is not a member of this project');
        }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 200, 'Task updated successfully', updatedTask);
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/tasks/:id/status ──────────────────────────────────────────
// Any member of the project or assignee can update status.
const updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const task = await Task.findById(req.params.id).populate('project', 'members');
        if (!task) return sendError(res, 404, 'Task not found');

        // Check project access
        if (req.user.role !== 'admin' && !task.project.members.includes(req.user._id)) {
            return sendError(res, 403, 'Access denied to update this task');
        }

        task.status = status;
        await task.save();

        return sendSuccess(res, 200, 'Task status updated successfully', task);
    } catch (error) {
        next(error);
    }
}

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────
// Admin only
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) return sendError(res, 404, 'Task not found');

    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
