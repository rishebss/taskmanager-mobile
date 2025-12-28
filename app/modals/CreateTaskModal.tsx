// app/modals/CreateTaskModal.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDateForDisplay, formatForDateTimeLocal } from '../../utils/dateUtils';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskData) => Promise<void>;
  loading?: boolean;
}

interface TaskData {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<TaskData>({
    title: '',
    description: '',
    status: 'pending',
    deadline: '',
    priority: 'medium',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize selectedDate from formData.deadline if it exists
  useEffect(() => {
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      if (!isNaN(deadlineDate.getTime())) {
        setSelectedDate(deadlineDate);
      }
    }
  }, [formData.deadline]);

  // Reset picker states when modal closes
  useEffect(() => {
    if (!visible) {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
  }, [visible]);

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

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      // Android handling is done in the inline onChange
      return;
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (date) {
      setSelectedDate(date);
      // Update form data with the selected date
      const newDateTime = new Date(date);
      newDateTime.setHours(selectedDate.getHours());
      newDateTime.setMinutes(selectedDate.getMinutes());
      handleFieldChange('deadline', newDateTime.toISOString());
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') {
      // Android handling is done in the inline onChange
      return;
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (time) {
      // Combine selected time with current date
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(time.getHours());
      newDateTime.setMinutes(time.getMinutes());
      setSelectedDate(newDateTime);

      // Update form data
      handleFieldChange('deadline', newDateTime.toISOString());
    }
  };

  const handleClearDeadline = () => {
    handleFieldChange('deadline', '');
    setSelectedDate(new Date());
  };

  const handleShowDatePicker = () => {
    console.log('handleShowDatePicker called, Platform:', Platform.OS);
    if (Platform.OS === 'android') {
      // On Android, the native picker should appear on top of the modal
      // If it doesn't work, it might be a React Native version issue
      setShowDatePicker(true);
    } else {
      // For iOS, show the picker modal
      setShowDatePicker(true);
    }
  };

  const handleShowTimePicker = () => {
    setShowTimePicker(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        deadline: '',
        priority: 'medium',
      });
      setSelectedDate(new Date());
      setErrors({});
      setShowDatePicker(false);
      setShowTimePicker(false);
      onClose();
    } catch (error) {
      // Error handling is done in parent
    }
  };

  const handleFieldChange = (field: keyof TaskData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  return (
    <>
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
                <Icon name="add-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.title}>Create New Task</Text>
                <TouchableOpacity onPress={onClose} disabled={loading}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Title */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    <Icon name="document-text-outline" size={16} color="#666" /> Title *
                  </Text>
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Enter task title"
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
                  <Text style={styles.label}>
                    <Icon name="text-outline" size={16} color="#666" /> Description
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      errors.description && styles.inputError,
                    ]}
                    placeholder="Enter task description"
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
                  <Text style={styles.label}>
                    <Icon name="time-outline" size={16} color="#666" /> Status
                  </Text>
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
                          { backgroundColor: formData.status === status ? '#007AFF' : '#fff' }
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
                  <Text style={styles.label}>
                    <Icon name="flag-outline" size={16} color="#666" /> Priority
                  </Text>
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
                  <Text style={styles.label}>
                    <Icon name="calendar-outline" size={16} color="#666" /> Deadline
                  </Text>
                  <View style={styles.dateTimeContainer}>
                    {Platform.OS === 'web' ? (
                      <View style={[styles.dateTimeInput, errors.deadline && styles.inputError]}>
                        <Icon name="calendar" size={20} color="#666" style={styles.dateTimeIcon} />
                        {/* @ts-ignore - Using native HTML input for web */}
                        <input
                          type="datetime-local"
                          value={formData.deadline ? formatForDateTimeLocal(formData.deadline) : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              // Convert datetime-local format to ISO string
                              const date = new Date(value);
                              if (!isNaN(date.getTime())) {
                                handleFieldChange('deadline', date.toISOString());
                                setSelectedDate(date);
                              }
                            } else {
                              handleClearDeadline();
                            }
                          }}
                          min={new Date().toISOString().slice(0, 16)}
                          disabled={loading}
                          style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: 16,
                            color: '#333',
                            backgroundColor: 'transparent',
                            padding: 0,
                            margin: 0,
                            fontFamily: 'inherit',
                          }}
                        />
                        {!!formData.deadline && (
                          <TouchableOpacity 
                            onPress={handleClearDeadline}
                            style={styles.clearButton}
                          >
                            <Icon name="close-circle" size={20} color="#FF3B30" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
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
                          <TouchableOpacity 
                            onPress={(e) => {
                              e.stopPropagation();
                              handleClearDeadline();
                            }} 
                            style={styles.clearButton}
                          >
                            <Icon name="close-circle" size={20} color="#FF3B30" />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  {!!errors.deadline && (
                    <Text style={styles.errorText}>{errors.deadline}</Text>
                  )}
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading || !formData.title.trim()}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Icon name="reload-outline" size={20} color="#fff" style={styles.spinner} />
                      <Text style={styles.submitButtonText}>Creating...</Text>
                    </View>
                  ) : (
                    <>
                      <Icon name="checkmark-circle-outline" size={20} color="#fff" />
                      <Text style={styles.submitButtonText}>Create Task</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* iOS DateTime Picker Modal - Rendered outside main modal */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.iosPickerOverlay}>
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
          </View>
        </Modal>
      )}

      {/* Android Date Picker - Rendered outside Modal to ensure it appears on top */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          key={`android-date-${showDatePicker}`}
          value={selectedDate}
          mode="date"
          display="calendar"
          onChange={(event, date) => {
            console.log('Android date picker onChange:', event.type, date);
            // Always close the picker first
            setShowDatePicker(false);
            
            if (event.type === 'set' && date) {
              const newDate = new Date(date);
              setSelectedDate(newDate);
              // Update form data with the selected date (time will be set later)
              const newDateTime = new Date(newDate);
              newDateTime.setHours(selectedDate.getHours());
              newDateTime.setMinutes(selectedDate.getMinutes());
              handleFieldChange('deadline', newDateTime.toISOString());
              // After date is selected, show time picker
              setTimeout(() => {
                setShowTimePicker(true);
              }, 500);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {/* Android Time Picker - Rendered outside Modal to ensure it appears on top */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          key={`android-time-${showTimePicker}`}
          value={selectedDate}
          mode="time"
          display="clock"
          onChange={(event, time) => {
            console.log('Android time picker onChange:', event.type, time);
            // Always close the picker first
            setShowTimePicker(false);
            
            if (event.type === 'set' && time) {
              // Combine selected time with current date
              const newDateTime = new Date(selectedDate);
              newDateTime.setHours(time.getHours());
              newDateTime.setMinutes(time.getMinutes());
              setSelectedDate(newDateTime);
              // Update form data
              handleFieldChange('deadline', newDateTime.toISOString());
            }
          }}
        />
      )}
    </>
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#99caff',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
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
    // Use Animated API or react-native-reanimated for spinning effect.
  },
  iosPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webDateTimeInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    outline: 'none',
  },
});

export default CreateTaskModal;