import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  User as UserIcon,
  Search,
  Filter,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { Task } from '../../types';
import { projectApi } from '../../services/api';

interface TasksTabProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskCreated: (newTask: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  projectId,
  tasks,
  onTaskUpdated,
  onTaskCreated,
  onTaskDeleted,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [editStatus, setEditStatus] = useState<Task['status']>('TODO');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleToggleStatus = async (task: Task) => {
    let nextStatus: Task['status'] = 'TODO';
    if (task.status === 'TODO') nextStatus = 'IN_PROGRESS';
    else if (task.status === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else if (task.status === 'BLOCKED') nextStatus = 'IN_PROGRESS';
    else if (task.status === 'COMPLETED') nextStatus = 'TODO';

    try {
      const updated = await projectApi.updateTask(projectId, task.id, { status: nextStatus });
      onTaskUpdated(updated);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await projectApi.createTask(projectId, {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        status: 'TODO',
      });
      onTaskCreated(created);
      setNewTitle('');
      setNewDesc('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setShowEditModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    setIsUpdating(true);
    try {
      const updated = await projectApi.updateTask(projectId, editingTask.id, {
        title: editTitle.trim(),
        description: editDesc,
        priority: editPriority,
        status: editStatus,
      });
      onTaskUpdated(updated);
      setShowEditModal(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await projectApi.deleteTask(projectId, taskId);
      if (onTaskDeleted) onTaskDeleted(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter !== 'ALL' && t.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
    }
    return true;
  });

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'LOW':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusBadge = (s: Task['status']) => {
    switch (s) {
      case 'COMPLETED':
        return { label: 'Completed', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 };
      case 'IN_PROGRESS':
        return { label: 'In Progress', style: 'bg-brand-500/10 text-brand-300 border-brand-500/30', icon: Clock };
      case 'BLOCKED':
        return { label: 'Blocked', style: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: ShieldAlert };
      case 'TODO':
      default:
        return { label: 'To Do', style: 'bg-surface-100 text-slate-400 border-border', icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-border">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'IN_PROGRESS', 'BLOCKED', 'TODO', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-surface-100 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search & Add button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface-100 border border-border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card border border-border text-slate-400 text-xs">
            No tasks found matching current filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const statusConfig = getStatusBadge(task.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl glass-card border border-border hover:border-brand-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Status Toggle Icon Button */}
                  <button
                    onClick={() => handleToggleStatus(task)}
                    title="Click to advance task status"
                    className={`p-2 rounded-xl border ${statusConfig.style} shrink-0 mt-0.5 hover:scale-110 transition-transform`}
                  >
                    <StatusIcon className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs md:text-sm font-semibold text-slate-100 group-hover:text-white ${
                        task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                      }`}>
                        {task.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono font-bold uppercase ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {task.assignee && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100 border border-border text-[11px] text-slate-300">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      <span>{task.assignee.name}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleToggleStatus(task)}
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${statusConfig.style}`}
                  >
                    {statusConfig.label}
                  </button>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      title="Edit Task"
                      className="p-1.5 text-slate-500 hover:text-brand-400 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete Task"
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-border p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement refresh token rotation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain context, requirements, and deliverables..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-border p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Edit Task</h3>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-border text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
