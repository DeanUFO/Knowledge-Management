
import React, { useState } from 'react';
import { Plus, MoreHorizontal, Calendar, ArrowRight, User as UserIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Project, Task, TaskStatus, TaskPriority, User } from '../types';
import { saveProject, getAvailableUsers, getCurrentUser } from '../services/storageService';

interface ProjectBoardProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onBack: () => void;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({ project, onUpdate, onBack }) => {
  const [isAddingTask, setIsAddingTask] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const currentUser = getCurrentUser();
  const allUsers = getAvailableUsers();

  const columns = [
    { id: TaskStatus.TODO, title: 'To Do', color: 'border-slate-300' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'border-blue-400' },
    { id: TaskStatus.REVIEW, title: 'Review', color: 'border-purple-400' },
    { id: TaskStatus.DONE, title: 'Done', color: 'border-emerald-400' },
  ];

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH: return 'bg-red-50 text-red-600 border-red-100';
      case TaskPriority.MEDIUM: return 'bg-amber-50 text-amber-600 border-amber-100';
      case TaskPriority.LOW: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: status,
      priority: TaskPriority.MEDIUM,
      createdAt: new Date().toISOString(),
      assigneeId: currentUser.id
    };

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, newTask]
    };

    onUpdate(saveProject(updatedProject));
    setNewTaskTitle('');
    setIsAddingTask(null);
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    const updatedProject = { ...project, tasks: updatedTasks };
    onUpdate(saveProject(updatedProject));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm('確定要刪除此任務嗎？')) return;
    const updatedTasks = project.tasks.filter(t => t.id !== taskId);
    const updatedProject = { ...project, tasks: updatedTasks };
    onUpdate(saveProject(updatedProject));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 flex items-center mb-1">
            <ArrowRight className="w-3 h-3 mr-1 rotate-180" /> Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            {project.name}
            <span className="ml-3 text-xs font-normal px-2 py-1 bg-slate-100 rounded-full text-slate-500">
              {project.status}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex -space-x-2">
           {project.members.map(mid => {
             const u = allUsers.find(user => user.id === mid);
             return u ? (
               <img key={mid} src={u.avatar} title={u.name} className="w-8 h-8 rounded-full border-2 border-white" />
             ) : null;
           })}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex h-full gap-6 min-w-[1000px]">
          {columns.map(col => (
            <div key={col.id} className="flex-1 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200/60 max-w-xs">
              {/* Column Header */}
              <div className={`p-4 border-b-2 ${col.color} bg-white rounded-t-xl flex justify-between items-center`}>
                <h3 className="font-semibold text-slate-700">{col.title}</h3>
                <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded-full">
                  {project.tasks.filter(t => t.status === col.id).length}
                </span>
              </div>

              {/* Tasks Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {project.tasks.filter(t => t.status === col.id).map(task => {
                   const assignee = allUsers.find(u => u.id === task.assigneeId);
                   return (
                    <div key={task.id} className="group bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <select 
                             className="text-xs border-none bg-slate-50 rounded cursor-pointer py-1 px-1 focus:ring-0 text-slate-500"
                             value={task.status}
                             onChange={(e) => handleMoveTask(task.id, e.target.value as TaskStatus)}
                           >
                             <option value={TaskStatus.TODO}>To Do</option>
                             <option value={TaskStatus.IN_PROGRESS}>Progress</option>
                             <option value={TaskStatus.REVIEW}>Review</option>
                             <option value={TaskStatus.DONE}>Done</option>
                           </select>
                           <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="ml-1 text-slate-300 hover:text-red-400"
                           >×</button>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-slate-800 mb-3">{task.title}</h4>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center text-xs text-slate-400">
                          {assignee && (
                            <img src={assignee.avatar} className="w-5 h-5 rounded-full mr-2" title={assignee.name} />
                          )}
                          {task.dueDate && (
                             <span className={`flex items-center ${new Date(task.dueDate) < new Date() ? 'text-red-400' : ''}`}>
                               <Clock className="w-3 h-3 mr-1" />
                               {new Date(task.dueDate).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                   );
                })}

                {/* Quick Add Input */}
                {isAddingTask === col.id ? (
                  <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm animate-fade-in">
                    <input
                      autoFocus
                      type="text"
                      placeholder="任務標題..."
                      className="w-full text-sm mb-2 px-2 py-1 border-b border-slate-100 focus:outline-none"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddTask(col.id);
                        if (e.key === 'Escape') setIsAddingTask(null);
                      }}
                    />
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => setIsAddingTask(null)}
                        className="text-xs text-slate-500 px-2 py-1"
                      >Cancel</button>
                      <button 
                        onClick={() => handleAddTask(col.id)}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded"
                      >Add</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setIsAddingTask(col.id); setNewTaskTitle(''); }}
                    className="w-full py-2 flex items-center justify-center text-sm text-slate-500 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-slate-200 transition-all dashed"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectBoard;
