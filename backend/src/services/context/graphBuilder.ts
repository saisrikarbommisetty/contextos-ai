import prisma from '../../config/prisma';
import { ContextGraphData, GraphNode, GraphEdge } from '../../types';

export class GraphBuilder {
  /**
   * Builds an interconnected graph of all entities in a project
   */
  public static async buildProjectGraph(projectId: string): Promise<ContextGraphData> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        tasks: {
          include: { assignee: true },
        },
        documents: true,
        meetings: true,
        decisions: true,
        activities: {
          take: 6,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Center Root Node: Project
    const projectNodeId = `node-project-${project.id}`;
    nodes.push({
      id: projectNodeId,
      label: project.name,
      type: 'PROJECT',
      status: project.status,
      subtitle: `${project.progress}% Complete`,
      details: {
        description: project.description,
        status: project.status,
        progress: project.progress,
        createdAt: project.createdAt,
      },
    });

    // Owner / Key People Node
    const ownerNodeId = `node-person-${project.owner.id}`;
    nodes.push({
      id: ownerNodeId,
      label: project.owner.name,
      type: 'PERSON',
      subtitle: project.owner.role,
      details: {
        email: project.owner.email,
        role: project.owner.role,
      },
    });
    edges.push({
      id: `edge-${projectNodeId}-${ownerNodeId}`,
      source: projectNodeId,
      target: ownerNodeId,
      label: 'LEAD_BY',
      type: 'LEAD',
    });

    // Decisions Nodes
    project.decisions.forEach((dec, idx) => {
      const decNodeId = `node-decision-${dec.id}`;
      nodes.push({
        id: decNodeId,
        label: dec.title,
        type: 'DECISION',
        subtitle: `by ${dec.madeBy}`,
        details: {
          title: dec.title,
          description: dec.description,
          madeBy: dec.madeBy,
          date: dec.date,
        },
      });
      edges.push({
        id: `edge-${projectNodeId}-${decNodeId}`,
        source: projectNodeId,
        target: decNodeId,
        label: 'DECISION_MADE',
        type: 'DECISION',
      });
    });

    // Task Nodes
    project.tasks.forEach((task) => {
      const taskNodeId = `node-task-${task.id}`;
      nodes.push({
        id: taskNodeId,
        label: task.title,
        type: 'TASK',
        status: task.status,
        priority: task.priority,
        subtitle: `${task.status} • ${task.priority}`,
        details: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee?.name || 'Unassigned',
          dueDate: task.dueDate,
        },
      });
      edges.push({
        id: `edge-${projectNodeId}-${taskNodeId}`,
        source: projectNodeId,
        target: taskNodeId,
        label: task.status === 'BLOCKED' ? 'BLOCKED_TASK' : 'HAS_TASK',
        type: task.status === 'BLOCKED' ? 'BLOCKER' : 'TASK',
      });

      // Connect task to assignee if available
      if (task.assignee) {
        const assigneeNodeId = `node-person-${task.assignee.id}`;
        if (!nodes.some((n) => n.id === assigneeNodeId)) {
          nodes.push({
            id: assigneeNodeId,
            label: task.assignee.name,
            type: 'PERSON',
            subtitle: task.assignee.role,
            details: { email: task.assignee.email, role: task.assignee.role },
          });
        }
        edges.push({
          id: `edge-${taskNodeId}-${assigneeNodeId}`,
          source: taskNodeId,
          target: assigneeNodeId,
          label: 'ASSIGNED_TO',
          type: 'ASSIGNMENT',
        });
      }

      // Link tasks to relevant decisions if title/desc matches
      if (task.title.toLowerCase().includes('supabase') || task.title.toLowerCase().includes('auth')) {
        const supDec = project.decisions.find((d) => d.title.toLowerCase().includes('supabase'));
        if (supDec) {
          edges.push({
            id: `edge-dec-${supDec.id}-task-${task.id}`,
            source: `node-decision-${supDec.id}`,
            target: taskNodeId,
            label: 'INFLUENCES',
            type: 'DEPENDENCY',
          });
        }
      }
      if (task.title.toLowerCase().includes('profile') || task.title.toLowerCase().includes('schema')) {
        const profDec = project.decisions.find((d) => d.title.toLowerCase().includes('profile') || d.title.toLowerCase().includes('schema'));
        if (profDec) {
          edges.push({
            id: `edge-dec-${profDec.id}-task-${task.id}`,
            source: `node-decision-${profDec.id}`,
            target: taskNodeId,
            label: 'MIGRATES',
            type: 'DEPENDENCY',
          });
        }
      }
    });

    // Documents Nodes
    project.documents.forEach((doc) => {
      const docNodeId = `node-doc-${doc.id}`;
      nodes.push({
        id: docNodeId,
        label: doc.title,
        type: 'DOCUMENT',
        subtitle: doc.type,
        details: {
          title: doc.title,
          description: doc.description,
          type: doc.type,
          url: doc.url,
          updatedAt: doc.updatedAt,
        },
      });
      edges.push({
        id: `edge-${projectNodeId}-${docNodeId}`,
        source: projectNodeId,
        target: docNodeId,
        label: 'DOCUMENTS',
        type: 'DOCUMENT',
      });
    });

    // Meetings Nodes
    project.meetings.forEach((meet) => {
      const meetNodeId = `node-meeting-${meet.id}`;
      nodes.push({
        id: meetNodeId,
        label: meet.title,
        type: 'MEETING',
        subtitle: new Date(meet.date).toLocaleDateString(),
        details: {
          title: meet.title,
          summary: meet.summary,
          date: meet.date,
          participants: meet.participants,
        },
      });
      edges.push({
        id: `edge-${projectNodeId}-${meetNodeId}`,
        source: projectNodeId,
        target: meetNodeId,
        label: 'DISCUSSED_IN',
        type: 'MEETING',
      });
    });

    return {
      projectId: project.id,
      projectName: project.name,
      nodes,
      edges,
    };
  }
}
