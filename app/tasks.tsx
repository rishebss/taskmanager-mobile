// app/tasks.tsx - UPDATED WITH ALL COMPONENTS
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FilterDropdown from '../components/FilterDropdown';
import SearchBar from '../components/SearchBar';
import TaskCard from '../components/TaskCard';
import { authService } from '../services/auth';
import { taskService } from '../services/taskService';
import CreateTaskModal from './modals/CreateTaskModal';
import ViewEditTaskModal from './modals/ViewEditTaskModal';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  userId?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TasksScreen() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await taskService.getTasks({
        status: filters.status || undefined,
        search: filters.search || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });

      // Handle different response structures
      let tasksData: Task[] = [];
      let paginationData: Pagination = pagination;

      if (response.success && response.data) {
        // Structure: { success: true, data: tasks[], pagination: {} }
        tasksData = response.data.map((task: any) => ({
          id: task._id || task.id,
          title: task.title,
          description: task.description,
          status: task.status || 'pending',
          deadline: task.deadline,
          priority: task.priority || 'medium',
          createdAt: task.createdAt,
          userId: task.userId,
        }));

        if (response.pagination) {
          paginationData = {
            page: response.pagination.page || 1,
            limit: response.pagination.limit || 10,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 1,
          };
        }
      } else if (Array.isArray(response)) {
        // Structure: tasks[]
        tasksData = response.map((task: any) => ({
          id: task._id || task.id,
          title: task.title,
          description: task.description,
          status: task.status || 'pending',
          deadline: task.deadline,
          priority: task.priority || 'medium',
          createdAt: task.createdAt,
          userId: task.userId,
        }));
      }

      setTasks(tasksData);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('❌ Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTasks();
  }, [pagination.page, filters.status, filters.search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [filters, pagination.page]);

  // Handlers
  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Use browser's native confirm dialog for web
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        try {
          await authService.logout();
          // Redirect to index.tsx (login page)
          router.replace('/');
        } catch (error) {
          console.error('Logout error:', error);
          window.alert('Failed to logout');
        }
      }
    } else {
      // Use React Native Alert for mobile platforms
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await authService.logout();
                // Redirect to index.tsx (login page)
                router.replace('/');
              } catch (error) {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout');
              }
            },
          },
        ]
      );
    }
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      setCreatingTask(true);
      await taskService.createTask(taskData);
      Alert.alert('Success', 'Task created successfully');
      setCreateModalVisible(false);
      fetchTasks(); // Refresh list
    } catch (error: any) {
      console.error('Create task error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to create task'
      );
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!selectedTask) return;

    try {
      setUpdatingTask(true);
      await taskService.updateTask(selectedTask.id, taskData);
      Alert.alert('Success', 'Task updated successfully');
      setIsEditing(false);
      fetchTasks(); // Refresh list
    } catch (error: any) {
      console.error('Update task error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update task'
      );
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      setDeletingTask(true);
      await taskService.deleteTask(selectedTask.id);
      Alert.alert('Success', 'Task deleted successfully');
      setViewModalVisible(false);
      setSelectedTask(null);
      fetchTasks(); // Refresh list
    } catch (error: any) {
      console.error('Delete task error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to delete task'
      );
    } finally {
      setDeletingTask(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'pending' ? 'in-progress' :
        currentStatus === 'in-progress' ? 'completed' : 'pending';

    try {
      await taskService.updateTaskStatus(taskId, nextStatus);
      // Update local state immediately
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: nextStatus } : task
      ));
    } catch (error: any) {
      console.error('Update status error:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setViewModalVisible(true);
    setIsEditing(false);
  };

  const handleDeletePress = async (taskId: string) => {
    if (Platform.OS === 'web') {
      // Use browser's native confirm dialog for web
      const confirmed = window.confirm('Are you sure you want to delete this task?');
      if (confirmed) {
        try {
          await taskService.deleteTask(taskId);
          setTasks(prev => prev.filter(task => task.id !== taskId));
          window.alert('Task deleted successfully');
        } catch (error) {
          console.error('Delete error:', error);
          window.alert('Failed to delete task');
        }
      }
    } else {
      // Use React Native Alert for mobile platforms
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await taskService.deleteTask(taskId);
                setTasks(prev => prev.filter(task => task.id !== taskId));
                Alert.alert('Success', 'Task deleted successfully');
              } catch (error) {
                console.error('Delete error:', error);
                Alert.alert('Error', 'Failed to delete task');
              }
            },
          },
        ]
      );
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Render
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <SearchBar onSearch={handleSearch} value={filters.search} />
        <FilterDropdown
          selectedStatus={filters.status}
          onStatusChange={handleStatusFilter}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item)}
            onDelete={() => handleDeletePress(item.id)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>
              {filters.status || filters.search
                ? 'Try changing your filters'
                : 'Create your first task!'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, pagination.page === 1 && styles.pageButtonDisabled]}
            onPress={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <Icon name="chevron-back" size={20} color={pagination.page === 1 ? "#ccc" : "#007AFF"} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {pagination.page} of {pagination.totalPages}
          </Text>

          <TouchableOpacity
            style={[styles.pageButton, pagination.page === pagination.totalPages && styles.pageButtonDisabled]}
            onPress={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            <Icon name="chevron-forward" size={20} color={pagination.page === pagination.totalPages ? "#ccc" : "#007AFF"} />
          </TouchableOpacity>
        </View>
      )}

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setCreateModalVisible(true)}
      >
        <Icon name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modals */}
      <CreateTaskModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateTask}
        loading={creatingTask}
      />

      <ViewEditTaskModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedTask(null);
          setIsEditing(false);
        }}
        task={selectedTask}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
        loading={updatingTask}
        deleteLoading={deletingTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
    alignItems: 'center', // Align items vertically in the center
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 20,
  },
  pageButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  pageButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  pageText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});