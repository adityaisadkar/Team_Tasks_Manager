import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { format } from 'date-fns';
import { Clock, Tag } from 'lucide-react';

const KanbanBoard = ({ projectId, tasks, members }) => {
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState({
    'todo': [],
    'in-progress': [],
    'review': [],
    'done': []
  });

  // Group tasks by status whenever tasks prop changes
  useEffect(() => {
    if (tasks) {
      const newCols = { 'todo': [], 'in-progress': [], 'review': [], 'done': [] };
      tasks.forEach(task => {
        if (newCols[task.status]) {
          newCols[task.status].push(task);
        }
      });
      setColumns(newCols);
    }
  }, [tasks]);

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }) => api.patch(`/tasks/${taskId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      queryClient.invalidateQueries(['dashboard-stats']);
    }
  });

  const updateAssignment = useMutation({
    mutationFn: ({ taskId, userId }) => api.put(`/tasks/${taskId}`, { assignedTo: userId || null }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['my-tasks']);
    }
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI update
    const sourceCol = [...columns[source.droppableId]];
    const destCol = [...columns[destination.droppableId]];
    const [movedTask] = sourceCol.splice(source.index, 1);
    
    movedTask.status = destination.droppableId;
    destCol.splice(destination.index, 0, movedTask);

    setColumns({
      ...columns,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    // API update if column changed
    if (source.droppableId !== destination.droppableId) {
      updateStatus.mutate({ taskId: draggableId, status: destination.droppableId });
    }
  };

  const columnConfig = {
    'todo': { title: 'To Do', color: 'bg-slate-100 border-slate-200 text-slate-700', bodyBg: 'bg-slate-50/70' },
    'in-progress': { title: 'In Progress', color: 'bg-blue-100 border-blue-200 text-blue-800', bodyBg: 'bg-blue-50/50' },
    'review': { title: 'Review', color: 'bg-amber-100 border-amber-200 text-amber-800', bodyBg: 'bg-amber-50/50' },
    'done': { title: 'Done', color: 'bg-emerald-100 border-emerald-200 text-emerald-800', bodyBg: 'bg-emerald-50/50' }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-4">
        {Object.entries(columns).map(([columnId, columnTasks]) => (
          <div key={columnId} className="w-full flex flex-col min-h-[350px]">
            <div className={`px-4 py-3 rounded-t-xl border-t border-x border-b-0 font-semibold flex justify-between items-center ${columnConfig[columnId].color}`}>
              <span>{columnConfig[columnId].title}</span>
              <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">{columnTasks.length}</span>
            </div>
            
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 p-3 rounded-b-xl border border-t-0 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-indigo-50/80 ring-2 ring-indigo-300 inset-0' : columnConfig[columnId].bodyBg
                  } ${columnConfig[columnId].color.split(' ')[1]}`}
                >
                  <div className="space-y-3">
                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 rounded-lg bg-white border border-gray-200 shadow-sm transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : 'hover:shadow-md'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {task.priority}
                              </span>
                              {task.assignedTo && (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold" title={task.assignedTo.name}>
                                  {task.assignedTo.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            
                            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                            {task.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>}
                            
                            {members && (
                              <div className="mt-2 mb-3">
                                <select 
                                  className="text-[10px] w-full bg-gray-50 border border-gray-200 rounded px-1 py-0.5 font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  value={task.assignedTo?._id || ''}
                                  onChange={(e) => updateAssignment.mutate({ taskId: task._id, userId: e.target.value })}
                                >
                                  <option value="">Unassigned</option>
                                  {members.map(m => (
                                    <option key={m._id} value={m._id}>{m.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                              {task.dueDate ? (
                                <div className={`flex items-center gap-1 ${task.isOverdue ? 'text-red-500 font-medium' : ''}`}>
                                  <Clock size={12} />
                                  {format(new Date(task.dueDate), 'MMM dd')}
                                </div>
                              ) : <span />}
                              
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Tag size={12} />
                                  {task.tags.length}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
