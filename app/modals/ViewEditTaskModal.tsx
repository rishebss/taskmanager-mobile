// app/modals/ViewEditTaskModal.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDate, formatDateForDisplay, formatTime, isOverdue } from '../../utils/dateUtils';

interface ViewEditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  task: any;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: (taskData: any) => Promise<void>;
  onDelete: () => Promise<void>;
  loading?: boolean;
  deleteLoading?: boolean;
}

const ViewEditTaskModal: React.FC<ViewEditTaskModalProps> = ({
  visible,
  onClose,
  task,
  isEditing,
  setIsEditing,
  onSave,
  onDelete,
  loading = false,
  deleteLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as const,
    deadline: '',
    priority: 'medium' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        deadline: task.deadline || '',
        priority: task.priority || 'medium',
      });
      if (task.deadline) {
        setSelectedDate(new Date(task.deadline));
      }
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        newErrors.deadline = 'Invalid date format';
      } else if (deadlineDate < new Date()) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in parent
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      // Use browser's native confirm dialog for web
      const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
      if (confirmed) {
        onDelete();
      }
    } else {
      // Use React Native Alert for mobile platforms
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: onDelete
          },
        ]
      );
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (date) {
      setSelectedDate(date);
      handleFieldChange('deadline', date.toISOString());
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (time) {
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(time.getHours());
      newDateTime.setMinutes(time.getMinutes());
      setSelectedDate(newDateTime);
      handleFieldChange('deadline', newDateTime.toISOString());
    }
  };

  const handleShowDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleClearDeadline = () => {
    handleFieldChange('deadline', '');
    setSelectedDate(new Date());
  };

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

  const overdue = task?.deadline ? isOverdue(task.deadline, task.status) : false;

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Icon
                name={isEditing ? "create-outline" : "document-text-outline"}
                size={24}
                color="#007AFF"
              />
              <Text style={styles.title}>
                {isEditing ? 'Edit Task' : 'Task Details'}
              </Text>
              <TouchableOpacity onPress={onClose} disabled={loading || deleteLoading}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Overdue warning */}
            {overdue && !isEditing && (
              <View style={styles.overdueWarning}>
                <Icon name="alert-circle" size={20} color="#FF3B30" />
                <Text style={styles.overdueText}>This task is overdue!</Text>
              </View>
            )}

            {/* Task Details / Edit Form */}
            <View style={styles.content}>
              {isEditing ? (
                // Edit Form
                <View style={styles.form}>
                  {/* Title */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                      style={[styles.input, errors.title && styles.inputError]}
                      value={formData.title}
                      onChangeText={(text) => handleFieldChange('title', text)}
                      maxLength={200}
                      editable={!loading}
                    />
                    {errors.title ? (
                      <Text style={styles.errorText}>{errors.title}</Text>
                    ) : (
                      <Text style={styles.charCount}>
                        {formData.title.length}/200 characters
                      </Text>
                    )}
                  </View>

                  {/* Description */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                      value={formData.description}
                      onChangeText={(text) => handleFieldChange('description', text)}
                      multiline
                      numberOfLines={4}
                      maxLength={1000}
                      editable={!loading}
                    />
                    {errors.description ? (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    ) : (
                      <Text style={styles.charCount}>
                        {formData.description.length}/1000 characters
                      </Text>
                    )}
                  </View>

                  {/* Status */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.radioGroup}>
                      {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.radioButton,
                            formData.status === status && styles.radioButtonSelected,
                          ]}
                          onPress={() => handleFieldChange('status', status)}
                          disabled={loading}
                        >
                          <View style={[
                            styles.radioCircle,
                            { backgroundColor: formData.status === status ? getStatusColor(status) : '#fff' }
                          ]} />
                          <Text style={[
                            styles.radioText,
                            formData.status === status && styles.radioTextSelected,
                          ]}>
                            {status === 'in-progress' ? 'In Progress' : status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Priority */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.radioGroup}>
                      {(['low', 'medium', 'high'] as const).map((priority) => (
                        <TouchableOpacity
                          key={priority}
                          style={[
                            styles.priorityButton,
                            formData.priority === priority && {
                              backgroundColor: getPriorityColor(priority) + '20',
                              borderColor: getPriorityColor(priority),
                            },
                          ]}
                          onPress={() => handleFieldChange('priority', priority)}
                          disabled={loading}
                        >
                          <View style={[
                            styles.priorityDot,
                            { backgroundColor: getPriorityColor(priority) }
                          ]} />
                          <Text style={[
                            styles.priorityText,
                            formData.priority === priority && {
                              color: getPriorityColor(priority),
                              fontWeight: '600',
                            },
                          ]}>
                            {priority}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Deadline */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Deadline</Text>
                    <View style={styles.dateTimeContainer}>
                      <TouchableOpacity
                        style={[styles.dateTimeInput, errors.deadline && styles.inputError]}
                        onPress={handleShowDatePicker}
                        disabled={loading}
                      >
                        <Icon name="calendar" size={20} color="#666" style={styles.dateTimeIcon} />
                        <Text style={[styles.dateTimeText, !formData.deadline && styles.placeholderText]}>
                          {formData.deadline ? formatDateForDisplay(formData.deadline) : 'Select date and time'}
                        </Text>
                        {!!formData.deadline && (
                          <TouchableOpacity onPress={handleClearDeadline} style={styles.clearButton}>
                            <Icon name="close-circle" size={20} color="#FF3B30" />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    </View>
                    {!!errors.deadline && (
                      <Text style={styles.errorText}>{errors.deadline}</Text>
                    )}
                  </View>
                </View>
              ) : (
                // View Mode
                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Title</Text>
                    <Text style={styles.detailValue}>{task.title}</Text>
                  </View>

                  {!!task.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailValue}>{task.description}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(task.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(task.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Priority</Text>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(task.priority) + '20' }
                    ]}>
                      <View style={[
                        styles.priorityDotSmall,
                        { backgroundColor: getPriorityColor(task.priority) }
                      ]} />
                      <Text style={[
                        styles.priorityText,
                        { color: getPriorityColor(task.priority) }
                      ]}>
                        {task.priority}
                      </Text>
                    </View>
                  </View>

                  {!!task.deadline && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Deadline</Text>
                      <View style={styles.deadlineInfo}>
                        <Icon name="calendar-outline" size={16} color="#666" />
                        <Text style={[
                          styles.deadlineText,
                          overdue && styles.deadlineOverdue
                        ]}>
                          {formatDate(task.deadline)} at {formatTime(task.deadline)}
                        </Text>
                        {overdue && (
                          <Icon name="alert-circle" size={16} color="#FF3B30" />
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(task.createdAt)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* iOS DateTime Picker Modal (Inside ScrollView like CreateTaskModal) */}
            {showDatePicker && Platform.OS === 'ios' && (
              <View style={styles.pickerModal}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Date & Time</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.pickerCloseButton}
                  >
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.pickerContent}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    style={styles.picker}
                  />
                  <View style={styles.timePickerContainer}>
                    <Text style={styles.timePickerLabel}>Select Time:</Text>
                    <DateTimePicker
                      value={selectedDate}
                      mode="time"
                      display="spinner"
                      onChange={handleTimeChange}
                      style={styles.timePicker}
                    />
                  </View>
                </View>
                <View style={styles.pickerFooter}>
                  <TouchableOpacity
                    style={styles.pickerCancelButton}
                    onPress={() => {
                      setShowDatePicker(false);
                      handleClearDeadline();
                    }}
                  >
                    <Text style={styles.pickerCancelButtonText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pickerConfirmButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.pickerConfirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Android Date Picker */}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="calendar"
                onChange={(event, date) => {
                  if (event.type === 'set' && date) {
                    handleDateChange(event, date);
                    setTimeout(() => {
                      setShowTimePicker(true);
                    }, 200);
                  } else {
                    setShowDatePicker(false);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            {/* Android Time Picker */}
            {showTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display="clock"
                onChange={handleTimeChange}
              />
            )}

            {/* Footer Buttons */}
            <View style={styles.footer}>
              {isEditing ? (
                // Edit mode buttons
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Icon name="reload-outline" size={20} color="#fff" style={styles.spinner} />
                        <Text style={styles.saveButtonText}>Saving...</Text>
                      </View>
                    ) : (
                      <>
                        <Icon name="checkmark-circle-outline" size={20} color="#fff" />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                // View mode buttons
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <View style={styles.loadingContainer}>
                        <Icon name="reload-outline" size={20} color="#fff" style={styles.spinner} />
                        <Text style={styles.deleteButtonText}>Deleting...</Text>
                      </View>
                    ) : (
                      <>
                        <Icon name="trash-outline" size={20} color="#fff" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                    disabled={loading || deleteLoading}
                  >
                    <Icon name="create-outline" size={20} color="#fff" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.closeButton]}
                    onPress={onClose}
                    disabled={loading || deleteLoading}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    gap: 8,
  },
  overdueText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
  },
  charCount: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    flex: 1,
    minWidth: '30%',
  },
  radioButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 8,
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  radioTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    flex: 1,
    minWidth: '30%',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  priorityDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deadlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deadlineText: {
    fontSize: 14,
    color: '#333',
  },
  deadlineOverdue: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  editButton: {
    backgroundColor: '#FF9500',
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#99caff',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinner: {
    // Note: animation is not supported in React Native StyleSheet.
  },
  // Add missing DateTime styles from CreateTaskModal
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
  },
  dateTimeIcon: {
    marginRight: 10,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  clearButton: {
    padding: 4,
  },
  // iOS Picker Modal Styles
  pickerModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pickerCloseButton: {
    padding: 4,
  },
  pickerContent: {
    padding: 16,
  },
  picker: {
    height: 350,
  },
  timePickerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timePicker: {
    height: 200,
  },
  pickerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  pickerCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  pickerCancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  pickerConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewEditTaskModal;