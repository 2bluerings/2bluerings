import { create } from 'zustand'
import type { Thread } from '@/hooks/use-threads-store'
import { useThreadsStore } from '@/hooks/use-threads-store'
import { useApiStore } from './use-api-store';

export type Project = {
  id: string
  name: string
  threads: Thread[]
}

interface ProjectsStore {
  items: Project[]
  create: (name: string) => Promise<Project>
  delete: (projectId: string) => Promise<void>
  load: () => Promise<Project[]>
  addThread: (projectId: string, thread: Thread) => void
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  items: [],
  create: async (name: string) => {
    const response = await useApiStore.getState().fetch(`/api/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })

    if (!response.ok) throw new Error('Failed to create project')

    const project = await response.json()

    set((state) => ({
      items: [project, ...state.items]
    }));

    return project
  },

  delete: async (projectId: string) => {
    const response = await useApiStore.getState().fetch(`/api/v1/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) throw new Error('Failed to delete project.')

    set((state) => ({
      items: [
        ...state.items.filter((p) => p.id != projectId)
      ]
    }));
  },

  load: async () => {
    const response = await useApiStore.getState().fetch(`/api/v1/projects`, {
      method: 'GET'
    })

    const projects = await response.json()

    set(() => ({
      items: projects
    }))

    projects.forEach((project: Project) => {
      useThreadsStore.getState().add(project.threads)
    });

    return projects;
  },

  addThread: async (projectId: string, thread: Thread) => {
    set((state) => {
      const projectIndex = state.items.findIndex(p => p.id === projectId);
      if (projectIndex === -1) return state;

      const updatedProject = {
        ...state.items[projectIndex],
        threads: [thread, ...state.items[projectIndex].threads]
      };

      useThreadsStore.getState().add([thread])

      const updatedItems = [...state.items];
      updatedItems[projectIndex] = updatedProject;

      return { items: updatedItems };
    });
  }
}));
