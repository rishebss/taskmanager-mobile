// services/taskService.ts
import api from './api';

interface TaskFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface TaskData {
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
}

export const taskService = {
  // Get all tasks with filters
  async getTasks(filters: TaskFilters = {}) {
    const params: any = {};
    
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    
    console.log('📡 Fetching tasks with params:', params);
    
    const response = await api.get('/todos', { params });
    console.log('📥 Tasks response:', response.data);
    
    return response.data;
  },

  // Get single task
  async getTaskById(id: string) {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  // Create task
  async createTask(taskData: TaskData) {
    console.log('📤 Creating task:', taskData);
    const response = await api.post('/todos', taskData);
    console.log('✅ Task created:', response.data);
    return response.data;
  },

  // Update task
  async updateTask(id: string, taskData: Partial<TaskData>) {
    console.log('📝 Updating task:', id, taskData);
    const response = await api.put(`/todos/${id}`, taskData);
    console.log('✅ Task updated:', response.data);
    return response.data;
  },

  // Delete task
  async deleteTask(id: string) {
    console.log('🗑️ Deleting task:', id);
    const response = await api.delete(`/todos/${id}`);
    console.log('✅ Task deleted:', response.data);
    return response.data;
  },

  // Update task status
  async updateTaskStatus(id: string, status: string) {
    console.log('🔄 Updating status:', { id, status });
    const response = await api.patch(`/todos/${id}/status`, { status });
    return response.data;
  }
};