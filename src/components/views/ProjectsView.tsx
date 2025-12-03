import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Project } from '../../types';
import { Plus, Folder, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { ViewModeSelector } from './ViewModeSelector';
import { BoardView } from '../tasks/BoardView';
import { CalendarView } from '../tasks/CalendarView';
import { TaskItem } from '../tasks/TaskItem';

type ViewMode = 'list' | 'board' | 'calendar';

export const ProjectsView: React.FC = () => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10b981');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  const { 
    projects, 
    sections, 
    tasks, 
    createProject, 
    setCurrentProject 
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

  const getProjectTasks = (projectId: string) => {
    return tasks.filter((task: any) => 
      task.projectId === projectId && !task.isCompleted
    );
  };

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter((task: any) => 
      task.projectId === projectId && !task.isCompleted
    ).length;
  };

  const getProjectSectionCount = (projectId: string) => {
    return sections.filter((section: any) => section.projectId === projectId).length;
  };

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
                style={{ backgroundColor: projects.find((p: any) => p.id === selectedProject)?.color }}
              ></div>
              <h3 className="font-medium text-gray-900">
                {projects.find((p: any) => p.id === selectedProject)?.name}
              </h3>
            </div>
            
            <ViewModeSelector
              currentMode={viewMode}
              onModeChange={setViewMode}
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
              {getProjectTasks(selectedProject).map((task: any) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
          
          {viewMode === 'board' && (
            <BoardView
              tasks={getProjectTasks(selectedProject)}
              title={projects.find((p: any) => p.id === selectedProject)?.name || 'Project'}
              groupBy="priority"
            />
          )}
          
          {viewMode === 'calendar' && (
            <CalendarView
              tasks={getProjectTasks(selectedProject)}
              title={projects.find((p: any) => p.id === selectedProject)?.name || 'Project'}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {projects.map((project: any) => (
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
                      // TODO: Show project menu
                    }}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </button>
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
    </div>
  );
};