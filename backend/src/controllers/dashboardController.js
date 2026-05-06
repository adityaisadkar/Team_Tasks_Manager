const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendSuccess } = require('../utils/helpers');

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let projectQuery = {};
    let taskQuery = {};

    if (req.user.role !== 'admin') {
      projectQuery = { members: userId };
      // For members, we could show stats for all tasks in their projects, or just tasks assigned to them.
      // Let's show stats for their projects
      const projects = await Project.find(projectQuery).select('_id');
      const projectIds = projects.map(p => p._id);
      taskQuery = { project: { $in: projectIds } };
    }

    const totalProjects = await Project.countDocuments(projectQuery);
    
    // Aggregate task stats
    const tasks = await Task.find(taskQuery);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now).length;

    const stats = {
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
    };

    return sendSuccess(res, 200, 'Dashboard stats retrieved', stats);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/dashboard/my-tasks ──────────────────────────────────────────
const getMyTasks = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { assignedTo: req.user._id };
    } else {
      // For admin, show all tasks so they can see all project allotments and progress
      query = {};
    }

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignedTo', 'name avatar')
      .sort({ dueDate: 1, createdAt: -1 });

    return sendSuccess(res, 200, 'Tasks retrieved', tasks);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/dashboard/overdue ───────────────────────────────────────────
const getOverdueTasks = async (req, res, next) => {
  try {
    let taskQuery = { 
        dueDate: { $lt: new Date() }, 
        status: { $ne: 'done' } 
    };

    if (req.user.role !== 'admin') {
      // Find projects user is a member of
      const projects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = projects.map(p => p._id);
      taskQuery.project = { $in: projectIds };
    }

    const tasks = await Task.find(taskQuery)
      .populate('project', 'name color')
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 });

    return sendSuccess(res, 200, 'Overdue tasks retrieved', tasks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getMyTasks,
  getOverdueTasks
};
