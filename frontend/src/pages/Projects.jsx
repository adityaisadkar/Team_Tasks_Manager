import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, FolderKanban, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

const Projects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#6366f1' });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(res => res.data.data),
  });

  const createProject = useMutation({
    mutationFn: (data) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', color: '#6366f1' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject.mutate(newProject);
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center">Loading projects...</div>;

  return (
    <>
      <div className="animate-fade-in space-y-8">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your team's projects and tasks.</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map(project => (
          <Link to={`/projects/${project._id}`} key={project._id} className="block group">
            <div className="glass-card p-6 h-full transition-transform hover:-translate-y-1 hover:shadow-lg border-t-4" style={{ borderTopColor: project.color }}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                  <FolderKanban size={24} style={{ color: project.color }} />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                  {project.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{project.description || 'No description provided.'}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{project.members?.length || 0} Members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{format(new Date(project.createdAt), 'MMM dd')}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {projects?.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center text-gray-500">
            No projects found. {user?.role === 'admin' && 'Create one to get started!'}
          </div>
        )}
      </div>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6 animate-fade-in bg-white">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="input-field min-h-[100px]"
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Theme Color</label>
                <input
                  type="color"
                  className="w-full h-10 rounded cursor-pointer border border-gray-200"
                  value={newProject.color}
                  onChange={e => setNewProject({...newProject, color: e.target.value})}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createProject.isPending}>
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
