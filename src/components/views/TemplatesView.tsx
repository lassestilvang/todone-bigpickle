import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { TemplateService, type TaskTemplate } from '../../lib/templateService';
import { 
  FileText, 
  Search, 
  Star, 
  TrendingUp, 
  Grid,
  List,
  ChevronRight
} from 'lucide-react';

export const TemplatesManager: React.FC = () => {
  const { createTask } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavorites, setShowFavorites] = useState(false);

  const categories = TemplateService.getTemplateCategories();
  const allTemplates = TemplateService.getBuiltinTemplates();

  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => template.category === selectedCategory);
    }

    // Filter by favorites
    if (showFavorites) {
      templates = templates.filter(template => template.isFavorite);
    }

    // Filter by search query
    if (searchQuery) {
      templates = TemplateService.searchTemplates(searchQuery).filter(template =>
        selectedCategory === 'all' || template.category === selectedCategory
      );
    }

    return templates;
  }, [allTemplates, selectedCategory, searchQuery, showFavorites]);

  const popularTemplates = TemplateService.getPopularTemplates();

  const handleUseTemplate = async (template: TaskTemplate) => {
    try {
      const tasks = TemplateService.templateToTasks(template);
      
      for (const taskData of tasks) {
        await createTask({
          ...taskData,
          order: 0, // Will be set by the store
        });
      }

      // Increment usage count
      TemplateService.incrementUsageCount(template.id);
    } catch (error) {
      console.error('Failed to create tasks from template:', error);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📋';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Templates</h1>
          <p className="text-gray-600 mt-1">Quickly create tasks from pre-built templates</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFavorites 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Star className="h-4 w-4 inline mr-2" />
            Favorites
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Templates
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Popular Templates */}
      {selectedCategory === 'all' && !searchQuery && !showFavorites && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Popular Templates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularTemplates.map(template => (
              <div
                key={template.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleUseTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.tasks.length} tasks</p>
                    </div>
                  </div>
                  {template.isFavorite && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                
                {template.description && (
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: getCategoryColor(template.category) }}
                  >
                    {categories.find(c => c.id === template.category)?.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid/List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {showFavorites ? 'Favorite Templates' : 
             selectedCategory === 'all' ? 'All Templates' :
             categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'No templates in this category'}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }>
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'p-4 flex items-center justify-between' : 'p-4'
                }`}
                onClick={() => handleUseTemplate(template)}
              >
                <div className={viewMode === 'list' ? 'flex items-center gap-4 flex-1' : ''}>
                  <div className={`flex items-center gap-3 ${viewMode === 'list' ? '' : 'mb-3'}`}>
                    <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                    <div className={viewMode === 'list' ? '' : ''}>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{template.tasks.length} tasks</span>
                        {template.usageCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{template.usageCount} uses</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {template.description && viewMode === 'grid' && (
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  )}
                  
                  {template.description && viewMode === 'list' && (
                    <p className="text-sm text-gray-600 flex-1">{template.description}</p>
                  )}
                </div>
                
                <div className={`flex items-center justify-between ${viewMode === 'list' ? '' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: getCategoryColor(template.category) }}
                    >
                      {categories.find(c => c.id === template.category)?.name}
                    </span>
                    {template.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};