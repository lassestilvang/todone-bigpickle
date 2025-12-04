import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { LabelsManager } from '../labels/LabelsManager';
import { FilteredTasksView } from '../tasks/FilteredTasksView';
import { Tag as TagIcon } from 'lucide-react';


export const LabelsView: React.FC = () => {
  const [selectedLabel] = useState<string | null>(null);
  const { labels } = useAppStore();
  
  const selectedLabelData = labels.find(l => l.id === selectedLabel);



  return (
    <div className="flex-1 flex">
      {/* Labels Sidebar */}
      <div className="w-80 border-r border-gray-200 overflow-auto">
        <LabelsManager />
      </div>

      {/* Label Tasks */}
      <div className="flex-1">
        {selectedLabelData ? (
          <FilteredTasksView
            title={selectedLabelData.name}
            query={{ labels: [selectedLabelData.id] }}
            emptyMessage={`No tasks with "${selectedLabelData.name}" label`}
            emptyIcon={<TagIcon className="h-12 w-12" />}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <TagIcon className="h-12 w-12 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a label
            </h3>
            <p className="text-sm">
              Choose a label from the sidebar to see tasks with that label
            </p>
          </div>
        )}
      </div>
    </div>
  );
};