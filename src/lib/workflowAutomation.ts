

export interface WorkflowTrigger {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_due' | 'task_overdue' | 'time_based' | 'label_added' | 'project_changed' | 'priority_changed';
  conditions: TriggerCondition[];
  isActive: boolean;
}

export interface TriggerCondition {
  field: 'priority' | 'project' | 'label' | 'due_date' | 'content' | 'time' | 'day_of_week';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'before' | 'after' | 'within';
  value: string | number | Date | string[];
}

export interface WorkflowAction {
  id: string;
  type: 'create_task' | 'update_task' | 'send_notification' | 'add_label' | 'remove_label' | 'set_priority' | 'set_due_date' | 'move_project' | 'create_comment' | 'start_timer' | 'stop_timer';
  parameters: Record<string, unknown>;
  delay?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
  runCount: number;
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggerData: unknown;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: unknown[];
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export class WorkflowAutomation {
  private static instance: WorkflowAutomation;
  private workflows: Workflow[] = [];
  private executions: WorkflowExecution[] = [];
  private isRunning = false;
  private intervalId?: number;

  private constructor() {
    this.initializeDefaultWorkflows();
    this.startAutomationEngine();
  }

  static getInstance(): WorkflowAutomation {
    if (!WorkflowAutomation.instance) {
      WorkflowAutomation.instance = new WorkflowAutomation();
    }
    return WorkflowAutomation.instance;
  }

  private initializeDefaultWorkflows(): void {
    const defaultWorkflows: Workflow[] = [
      {
        id: 'daily-standup-reminder',
        name: 'Daily Standup Reminder',
        description: 'Create a daily standup task at 9 AM',
        trigger: {
          id: 'daily-standup-trigger',
          type: 'time_based',
          conditions: [
            {
              field: 'time',
              operator: 'equals',
              value: '09:00'
            }
          ],
          isActive: true
        },
        actions: [
          {
            id: 'create-standup-task',
            type: 'create_task',
            parameters: {
              content: 'Daily Standup',
              priority: 'p2'
            }
          }
        ],
        isActive: true,
        runCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.workflows = defaultWorkflows;
  }

  private startAutomationEngine(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    
    this.intervalId = window.setInterval(() => {
      this.checkTimeBasedTriggers();
    }, 60000);
  }

  stopAutomationEngine(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
  }

  async triggerWorkflows(
    triggerType: WorkflowTrigger['type'],
    _triggerData: unknown
  ): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = [];

    const matchingWorkflows = this.workflows.filter(workflow => 
      workflow.isActive &&
      workflow.trigger.type === triggerType
    );

    for (const workflow of matchingWorkflows) {
      const execution = await this.executeWorkflow(workflow, _triggerData);
      executions.push(execution);
    }

    return executions;
  }

  private async executeWorkflow(
    workflow: Workflow,
    _triggerData: unknown
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId: workflow.id,
      triggerData: _triggerData,
      status: 'running',
      results: [],
      startedAt: new Date()
    };

    try {
      for (const action of workflow.actions) {
        const result = await this.executeAction(action);
        execution.results.push(result);
      }

      execution.status = 'completed';
      execution.completedAt = new Date();

      workflow.runCount++;
      workflow.lastRun = new Date();

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
    }

    this.executions.push(execution);
    return execution;
  }

  private async executeAction(
    action: WorkflowAction
  ): Promise<unknown> {
    switch (action.type) {
      case 'create_task':
        return { action: 'create_task', parameters: action.parameters, success: true };
      
      case 'update_task':
        return { action: 'update_task', parameters: action.parameters, success: true };
      
      case 'send_notification':
        return { action: 'send_notification', parameters: action.parameters, success: true };
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private checkTimeBasedTriggers(): void {
    const timeBasedWorkflows = this.workflows.filter(workflow => 
      workflow.isActive &&
      workflow.trigger.type === 'time_based'
    );

    for (const workflow of timeBasedWorkflows) {
      this.executeWorkflow(workflow, { currentTime: new Date() });
    }
  }



  getWorkflows(): Workflow[] {
    return [...this.workflows];
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.find(w => w.id === id);
  }

  addWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): Workflow {
    const newWorkflow: Workflow = {
      ...workflow,
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      runCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.push(newWorkflow);
    return newWorkflow;
  }

  updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | null {
    const workflowIndex = this.workflows.findIndex(w => w.id === id);
    if (workflowIndex === -1) return null;

    this.workflows[workflowIndex] = {
      ...this.workflows[workflowIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.workflows[workflowIndex];
  }

  deleteWorkflow(id: string): boolean {
    const initialLength = this.workflows.length;
    this.workflows = this.workflows.filter(w => w.id !== id);
    return this.workflows.length < initialLength;
  }

  getExecutions(): WorkflowExecution[] {
    return [...this.executions];
  }

  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return this.executions.filter(e => e.workflowId === workflowId);
  }
}