import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { Project } from '../../types';
import { Plus, Folder, MoreHorizontal, Edit2, Trash2, Archive } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10b981');
  
  const { 
    projects, 
    sections, 
    tasks, 
    createProject, 
    deleteProject, 
    setCurrentProject 
  } = useAppStore();

  const projectColors = [
    '#10b981', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f59e0b', '#6b7280', '#84cc16'
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
        ownerId: 'user-1', // TODO: Get from user
        order: projects.length
      });

      setNewProjectName('');
      setIsCreatingProject(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(task => 
      task.projectId === projectId && !task.isCompleted
    ).length;
  };

  const getProjectSectionCount = (projectId: string) => {
    return sections.filter(section => section.projectId === projectId).length;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
            <p className="text-sm text-gray-500 mt-1">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          
          <button
            onClick={() => setIsCreatingProject(true)}
            className="btn btn-primary px-3 py-2 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-auto p-6">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Folder className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Create projects to organize your tasks
            </p>
            <button 
              onClick={() => setIsCreatingProject(true)}
              className="btn btn-primary"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setCurrentProject(project.id)}
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
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Show project menu
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </button>
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

                {/* View Mode Indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">View:</span>
                  <span className="text-xs font-medium text-gray-600 capitalize">
                    {project.viewMode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                      required
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
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === color
                              ? 'border-gray-900'
                              : 'border-transparent'
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
    </div>
  );
};