import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, Plus, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import type { Workflow, WorkflowExecution } from '../lib/workflowAutomation';

import { WorkflowAutomation } from '../lib/workflowAutomation';

export const WorkflowAutomationPanel: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isEngineRunning] = useState(true);

  const workflowEngine = WorkflowAutomation.getInstance();

  useEffect(() => {
    setWorkflows(workflowEngine.getWorkflows());
    setExecutions(workflowEngine.getExecutions().slice(-20));
  }, [workflowEngine]);

  const toggleWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      const updatedWorkflow = workflowEngine.updateWorkflow(workflowId, {
        isActive: !workflow.isActive
      });
      if (updatedWorkflow) {
        setWorkflows(workflowEngine.getWorkflows());
      }
    }
  };

  const deleteWorkflow = (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      workflowEngine.deleteWorkflow(workflowId);
      setWorkflows(workflowEngine.getWorkflows());
    }
  };

  const runWorkflowManually = async (workflow: Workflow) => {
    try {
      const executions = await workflowEngine.triggerWorkflows(
        workflow.trigger.type,
        { manual: true, timestamp: new Date() }
      );

      setExecutions(workflowEngine.getExecutions().slice(-20));
      
      alert(`Workflow executed successfully! ${executions.length} execution(s) completed.`);
    } catch (error) {
      console.error('Error running workflow:', error);
      alert('Error running workflow. Check console for details.');
    }
  };

  const getTriggerTypeIcon = (type: Workflow['trigger']['type']) => {
    switch (type) {
      case 'task_created': return <Plus className="w-4 h-4" />;
      case 'task_completed': return <CheckCircle className="w-4 h-4" />;
      case 'task_due': return <Clock className="w-4 h-4" />;
      case 'task_overdue': return <AlertCircle className="w-4 h-4" />;
      case 'time_based': return <Clock className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const activeWorkflows = workflows.filter(w => w.isActive);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="font-medium text-gray-900">Workflow Automation</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${
              isEngineRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {isEngineRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeWorkflows.length}</div>
            <div className="text-xs text-gray-500">Active Workflows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {executions.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">Successful Runs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {executions.filter(e => e.status === 'failed').length}
            </div>
            <div className="text-xs text-gray-500">Failed Runs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {workflows.reduce((sum, w) => sum + w.runCount, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Executions</div>
          </div>
        </div>

        {/* Workflows List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Workflows</h4>
            <span className="text-xs text-gray-500">
              {activeWorkflows.length} of {workflows.length} active
            </span>
          </div>

          <div className="space-y-2">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                className={`border rounded-lg p-3 transition-colors ${
                  workflow.isActive 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1">
                    {getTriggerTypeIcon(workflow.trigger.type)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {workflow.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {workflow.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">
                      {workflow.runCount} runs
                    </span>
                    <button
                      onClick={() => toggleWorkflow(workflow.id)}
                      className={`p-1 rounded transition-colors ${
                        workflow.isActive 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {workflow.isActive ? <CheckCircle className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => runWorkflowManually(workflow)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Trigger: {workflow.trigger.type.replace('_', ' ')}</span>
                  <span>Actions: {workflow.actions.length}</span>
                  {workflow.lastRun && (
                    <span>Last run: {workflow.lastRun.toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};