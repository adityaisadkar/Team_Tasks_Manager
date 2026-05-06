import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import { Plus, ArrowLeft, Users, Settings } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then(res => res.data.data),
  });

  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => api.get(`/tasks/project/${id}`).then(res => res.data.data),
  });

  const createTask = useMutation({
    mutationFn: (data) => api.post(`/tasks/project/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', id]);
      queryClient.invalidateQueries(['dashboard-stats']);
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
    }
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/auth/users').then(res => res.data.data),
    enabled: isMemberModalOpen && user?.role === 'admin',
  });

  const addMember = useMutation({
    mutationFn: (userId) => api.post(`/projects/${id}/members`, { userId }),
    onSuccess: () => queryClient.invalidateQueries(['project', id])
  });

  const removeMember = useMutation({
    mutationFn: (userId) => api.delete(`/projects/${id}/members/${userId}`),
    onSuccess: () => queryClient.invalidateQueries(['project', id])
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    
    // Convert standard HTML5 date string ("YYYY-MM-DD") to full ISO-8601 string for backend validation
    const payload = {
      ...newTask,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
    };
    
    createTask.mutate(payload);
  };

  if (loadingProject || loadingTasks) return <div className="flex h-64 items-center justify-center">Loading project...</div>;
  if (!project) return <div className="flex h-64 items-center justify-center text-red-500">Project not found</div>;

  return (
    <>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link to="/projects" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4" style={{ borderTopColor: project.color }}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
              {project.status.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-500">{project.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-2">
            {project.members.slice(0, 3).map((member, i) => (
              <div key={member._id} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700" title={member.name}>
                {member.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {project.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          
          {user?.role === 'admin' && (
            <button onClick={() => setIsMemberModalOpen(true)} className="btn btn-secondary px-3 py-2" title="Manage Members">
              <Users size={18} />
            </button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => setIsTaskModalOpen(true)} className="btn btn-primary">
              <Plus size={18} /> Add Task
            </button>
          )}
        </div>
      </div>

      <KanbanBoard projectId={id} tasks={tasks} members={project.members} />

      </div>

      {/* Manage Members Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6 animate-fade-in bg-white max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Members</h2>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-3 overflow-y-auto pr-2">
              {allUsers?.map(u => {
                const isMember = project.members.some(m => m._id === u._id);
                const isOwner = project.owner._id === u._id;
                return (
                  <div key={u._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{u.name} {isOwner && <span className="text-xs text-indigo-500 font-normal ml-1">(Owner)</span>}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    {isOwner ? (
                      <span className="text-xs text-gray-400 font-medium px-2 py-1 shrink-0">Owner</span>
                    ) : isMember ? (
                      <button 
                        onClick={() => removeMember.mutate(u._id)}
                        disabled={removeMember.isPending}
                        className="text-[10px] font-bold text-red-600 uppercase tracking-wider px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                      >
                        Remove
                      </button>
                    ) : (
                      <button 
                        onClick={() => addMember.mutate(u._id)}
                        disabled={addMember.isPending}
                        className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider px-3 py-1.5 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors shrink-0"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
              {!allUsers && <div className="text-center text-sm text-gray-500 py-4">Loading team members...</div>}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6 animate-fade-in bg-white">
            <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="input-field min-h-[80px]"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    className="input-field"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign To</label>
                <select
                  className="input-field"
                  value={newTask.assignedTo}
                  onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {project.members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createTask.isPending}>
                  {createTask.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectDetail;
