// components/TaskCard.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDate, isOverdue } from '../utils/dateUtils';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    deadline?: string;
    priority?: 'low' | 'medium' | 'high';
    createdAt: string;
  };
  onPress: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, currentStatus: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onDelete,
  onUpdateStatus
}) => {
  const overdue = task.deadline ? isOverdue(task.deadline, task.status) : false;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#34C759';
      case 'in-progress': return '#007AFF';
      case 'pending': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        overdue && styles.cardOverdue
      ]}
      onPress={onPress}
    >
      {/* Overdue indicator */}
      {overdue && (
        <View style={styles.overdueStripe} />
      )}

      <View style={styles.cardHeader}>
        <View style={[
          styles.priorityDot,
          { backgroundColor: getPriorityColor(task.priority) }
        ]} />
        <Text
          style={[
            styles.title,
            overdue && styles.titleOverdue
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <TouchableOpacity
          onPress={() => onDelete(task.id)}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Icon name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {task.description ? (
        <Text
          style={[
            styles.description,
            overdue && styles.descriptionOverdue
          ]}
          numberOfLines={2}
        >
          {task.description}
        </Text>
      ) : null}

      {!!task.deadline && (
        <View style={[
          styles.deadlineContainer,
          overdue && styles.deadlineOverdue
        ]}>
          <Icon
            name="calendar-outline"
            size={16}
            color={overdue ? '#FF6B6B' : '#666'}
          />
          <View style={styles.deadlineTextContainer}>
            <Text style={[
              styles.deadlineText,
              overdue && styles.deadlineTextOverdue
            ]}>
              Due: {formatDate(task.deadline)}
            </Text>
            {overdue && (
              <Text style={styles.overdueText}>
                <Icon name="alert-circle" size={12} color="#FF6B6B" /> OVERDUE
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            { backgroundColor: getStatusColor(task.status) }
          ]}
          onPress={() => onUpdateStatus(task.id, task.status)}
        >
          <Text style={styles.statusText}>
            {getStatusText(task.status)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.date}>
          {formatDate(task.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  cardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  overdueStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FF3B30',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  titleOverdue: {
    color: '#FF3B30',
  },
  deleteButton: {
    padding: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  descriptionOverdue: {
    color: '#FF6B6B',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  deadlineOverdue: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deadlineTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  deadlineText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  deadlineTextOverdue: {
    color: '#FF3B30',
  },
  overdueText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default TaskCard;