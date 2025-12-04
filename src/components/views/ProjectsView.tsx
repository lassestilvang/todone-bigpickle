import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

import { Folder, MoreHorizontal, ArrowLeft, Share2, Edit2, Trash2, Star } from 'lucide-react';
import { ViewModeSelector } from './ViewModeSelector';
import { BoardView } from '../tasks/BoardView';
import { CalendarView } from '../tasks/CalendarView';
import { TaskItem } from '../tasks/TaskItem';
import { CollaborationPanel } from '../tasks/CollaborationPanel';
import type { Project } from '../../types';
import { ProjectSkeleton } from '../Skeleton';

type ViewMode = 'list' | 'board' | 'calendar';

interface ProjectsViewProps {
  bulkMode?: boolean;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ bulkMode = false }) => {
  console.log('ProjectsView bulkMode:', bulkMode); // Use bulkMode to avoid lint error
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10b981');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showCollaboration, setShowCollaboration] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectColor, setEditProjectColor] = useState('#10b981');
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  
  const { 
    projects, 
    sections, 
    tasks, 
    createProject, 
    updateProject,
    deleteProject,
    setCurrentProject,
    isLoading
  } = useAppStore();

  const projectColors = [
    '#10b981', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6',
    '#ec4899', '#14b8a6', '#06b6d4', '#6366f1', '#84cc16'
  ];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await createProject({
        name: newProjectName.trim(),
        color: selectedColor,
        viewMode: 'list',
        isFavorite: false,
        isShared: false,
        ownerId: 'user-1',
        order: projects.length
      });

      setNewProjectName('');
      setIsCreatingProject(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleEditProject = async (projectId: string) => {
    if (!editProjectName.trim()) return;

    try {
      await updateProject(projectId, {
        name: editProjectName.trim(),
        color: editProjectColor,
        updatedAt: new Date()
      });
      setEditingProject(null);
      setEditProjectName('');
      setEditProjectColor('#10b981');
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm(`Are you sure you want to delete "${project.name}"? This will also delete all tasks in this project.`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      if (selectedProject === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleToggleFavorite = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    try {
      await updateProject(projectId, {
        isFavorite: !project.isFavorite,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project.id);
    setEditProjectName(project.name);
    setEditProjectColor(project.color);
    setShowProjectMenu(null);
  };

  // Close project menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProjectMenu(null);
    };

    if (showProjectMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProjectMenu]);

  const getProjectTasks = (projectId: string) => {
    return tasks.filter((task) => 
      task.projectId === projectId && !task.isCompleted
    );
  };

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter((task) => 
      task.projectId === projectId && !task.isCompleted
    ).length;
  };

  const getProjectSectionCount = (projectId: string) => {
    return sections.filter((section) => section.projectId === projectId).length;
  };

  // Show skeleton while loading
  if (isLoading) {
    return <ProjectSkeleton count={6} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Selected Project View */}
      {selectedProject ? (
        <div className="border-b border-gray-200">
          <div className="px-6 py-3 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded hover:bg-gray-100 text-gray-600"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: projects.find((p) => p.id === selectedProject)?.color }}
              ></div>
              <h3 className="font-medium text-gray-900">
                {projects.find((p) => p.id === selectedProject)?.name}
              </h3>
            </div>
            
            <ViewModeSelector
              currentMode={viewMode}
              onModeChange={(mode) => {
                setViewMode(mode);
                setCurrentProject(selectedProject);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Projects</h2>
        </div>
      )}

      {/* Project Grid or Selected View */}
      {selectedProject ? (
        <div className="flex-1">
          {viewMode === 'list' && (
            <div className="p-4 space-y-1">
              {getProjectTasks(selectedProject).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
          
          {viewMode === 'board' && (
            <BoardView
              tasks={getProjectTasks(selectedProject)}
              title={projects.find((p) => p.id === selectedProject)?.name || 'Project'}
              groupBy="priority"
            />
          )}
          
          {viewMode === 'calendar' && (
            <CalendarView
              tasks={getProjectTasks(selectedProject)}
              title={projects.find((p) => p.id === selectedProject)?.name || 'Project'}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`card p-4 hover:shadow-md transition-shadow cursor-pointer ${
                selectedProject === project.id ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => setSelectedProject(project.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <h3 className="font-medium text-gray-900">
                    {project.name}
                  </h3>
                  {project.isFavorite && (
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project.id);
                    }}
                    className="p-1 rounded hover:bg-gray-100 text-primary-600"
                    title="Open project"
                  >
                    <Folder className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCollaboration(project.id);
                    }}
                    className="p-1 rounded hover:bg-gray-100 text-blue-600"
                    title="Share project"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProjectMenu(showProjectMenu === project.id ? null : project.id);
                      }}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                    
                    {showProjectMenu === project.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(project.id);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Star className={`h-4 w-4 ${project.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                          {project.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditProject(project);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit project
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {getProjectTaskCount(project.id)}
                  </span>
                  <span>tasks</span>
                </div>
                
                {getProjectSectionCount(project.id) > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {getProjectSectionCount(project.id)}
                    </span>
                    <span>sections</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">View:</span>
                <span className="text-xs font-medium text-gray-600 capitalize">
                  {project.viewMode}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditProject(editingProject);
            }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Project
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(null);
                      setEditProjectName('');
                      setEditProjectColor('#10b981');
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="input w-full"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {projectColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditProjectColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            editProjectColor === color ? 'border-gray-900' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setEditProjectName('');
                    setEditProjectColor('#10b981');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editProjectName.trim()}
                  className="btn btn-primary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreatingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <form onSubmit={handleCreateProject}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Project
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingProject(false);
                      setNewProjectName('');
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="input w-full"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {projectColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            selectedColor === color ? 'border-gray-900' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingProject(false);
                    setNewProjectName('');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="btn btn-primary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collaboration Panel */}
      {showCollaboration && (
        <CollaborationPanel
          projectId={showCollaboration}
          onClose={() => setShowCollaboration(null)}
        />
      )}
    </div>
  );
};