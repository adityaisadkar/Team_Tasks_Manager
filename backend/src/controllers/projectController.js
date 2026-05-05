const Project = require('../models/Project');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/helpers');

// ─── GET /api/projects ────────────────────────────────────────────────────
// Admin: gets all projects. Member: gets projects they are a member of.
const getProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/projects/:id ────────────────────────────────────────────────
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Check access for members
    if (req.user.role !== 'admin' && !project.members.some((m) => m._id.equals(req.user._id))) {
      return sendError(res, 403, 'Access denied to this project');
    }

    return sendSuccess(res, 200, 'Project retrieved successfully', project);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/projects ───────────────────────────────────────────────────
// Admin only
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [req.user._id], // Owner is automatically a member
    });

    return sendSuccess(res, 201, 'Project created successfully', project);
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/projects/:id ────────────────────────────────────────────────
// Admin only
const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, color } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, color },
      { new: true, runValidators: true }
    );

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    return sendSuccess(res, 200, 'Project updated successfully', project);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────
// Admin only
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    // Optionally: Cascade delete tasks associated with this project
    // await Task.deleteMany({ project: req.params.id });

    return sendSuccess(res, 200, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/projects/:id/members ───────────────────────────────────────
// Admin only
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) return sendError(res, 400, 'User ID is required');

    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, 404, 'Project not found');

    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, 'User not found');

    if (project.members.includes(userId)) {
      return sendError(res, 400, 'User is already a member of this project');
    }

    project.members.push(userId);
    await project.save();

    return sendSuccess(res, 200, 'Member added successfully', project);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/projects/:id/members/:userId ─────────────────────────────
// Admin only
const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);
    if (!project) return sendError(res, 404, 'Project not found');

    // Prevent removing the owner
    if (project.owner.equals(userId)) {
        return sendError(res, 400, 'Cannot remove the project owner');
    }

    project.members = project.members.filter((memberId) => !memberId.equals(userId));
    await project.save();

    return sendSuccess(res, 200, 'Member removed successfully', project);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
