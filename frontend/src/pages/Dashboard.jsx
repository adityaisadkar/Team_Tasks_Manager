import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { CheckCircle2, Clock, FolderKanban, AlertCircle, Settings, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
  <div className="glass-card p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-').split(' ')[0]} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data.data),
  });

  const { data: myTasks, isLoading: loadingTasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.get('/dashboard/my-tasks').then(res => res.data.data),
  });

  if (loadingStats || loadingTasks) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Current Date</p>
          <p className="text-lg font-bold text-gray-700">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={statsData?.totalProjects || 0}
          icon={FolderKanban}
          colorClass="bg-violet-600"
        />
        <StatCard
          title="Total Tasks"
          value={statsData?.totalTasks || 0}
          icon={CheckCircle2}
          colorClass="bg-cyan-600"
        />
        <StatCard
          title="Completion Rate"
          value={`${statsData?.completionRate || 0}%`}
          icon={Clock}
          colorClass="bg-emerald-600"
        />
        <StatCard
          title="Overdue Tasks"
          value={statsData?.overdueTasks || 0}
          icon={AlertCircle}
          colorClass="bg-red-600"
          trend={statsData?.overdueTasks > 0 ? `${statsData.overdueTasks} requires attention` : "All on track"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{user?.role === 'admin' ? 'Assigned Tasks' : 'My Assigned Tasks'}</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View all</button>
          </div>
          <div className="p-0">
            {myTasks?.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-gray-300" size={32} />
                </div>
                <p className="text-lg font-medium">No pending tasks</p>
                <p className="text-sm">You're all caught up! Take a break.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Task Title</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Project</th>
                      {user?.role === 'admin' && (
                        <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Assigned To</th>
                      )}
                      <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myTasks?.slice(0, 5).map(task => (
                      <tr key={task._id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{task.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {task.project?.name}
                          </span>
                        </td>
                        {user?.role === 'admin' && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {task.assignedTo ? (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                                    {task.assignedTo?.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">{task.assignedTo?.name}</span>
                                </>
                              ) : (
                                <span className="text-sm font-italic text-gray-400">Unassigned</span>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'review' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {task.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                              task.priority === 'medium' ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`} />
                            <span className={`text-xs font-bold ${task.priority === 'high' ? 'text-red-600' :
                              task.priority === 'medium' ? 'text-amber-600' :
                                'text-emerald-600'
                              }`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No date'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Overview</h2>
          <div className="space-y-6 flex-1">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="text-sm font-semibold text-indigo-900 mb-1">Productivity Tip</p>
              <p className="text-xs text-indigo-700 leading-relaxed">Focus on high priority tasks first to maximize your impact today.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-bold text-gray-900">45%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Team Activity</span>
                  <span className="font-bold text-gray-900">82%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <button className="mt-8 w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <Settings size={18} />
            Dashboard Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
