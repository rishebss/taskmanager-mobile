// components/FilterDropdown.tsx - SMALLER BUTTON VERSION
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface FilterDropdownProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Tasks', icon: 'list' },
    { value: 'pending', label: 'Pending', icon: 'time-outline' },
    { value: 'in-progress', label: 'In Progress', icon: 'sync-outline' },
    { value: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
  ];

  const getActiveFilterLabel = () => {
    const option = statusOptions.find(opt => opt.value === selectedStatus);
    return option?.label || 'All Tasks';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Icon name="time-outline" size={14} color="#FF9500" />;
      case 'in-progress': return <Icon name="sync-outline" size={14} color="#007AFF" />;
      case 'completed': return <Icon name="checkmark-done-outline" size={14} color="#34C759" />;
      default: return <Icon name="list" size={14} color="#666" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'in-progress': return '#007AFF';
      case 'completed': return '#34C759';
      default: return '#666';
    }
  };

  const handleSelect = (status: string) => {
    onStatusChange(status);
    setModalVisible(false);
  };

  return (
    <>
      {/* Filter Button - Smaller, icon only */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="filter-outline" size={18} color="#666" />
        <Icon 
          name="chevron-down" 
          size={14} 
          color="#666" 
          style={styles.chevronIcon}
        />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filter by Status</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                
                {/* Active Filter Indicator */}
                <View style={styles.activeFilterContainer}>
                  <Text style={styles.activeFilterLabel}>ACTIVE FILTER</Text>
                  <View style={styles.activeFilterBadge}>
                    {getStatusIcon(selectedStatus)}
                    <Text style={[styles.activeFilterText, { color: getStatusColor(selectedStatus) }]}>
                      {getActiveFilterLabel()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Status Options */}
                <ScrollView showsVerticalScrollIndicator={false} style={styles.optionsList}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.option,
                        selectedStatus === option.value && styles.optionSelected,
                      ]}
                      onPress={() => handleSelect(option.value)}
                    >
                      <View style={styles.optionLeft}>
                        <View style={[
                          styles.optionIconContainer,
                          selectedStatus === option.value && {
                            backgroundColor: getStatusColor(option.value) + '15',
                            borderColor: getStatusColor(option.value) + '50',
                          }
                        ]}>
                          <Icon 
                            name={option.icon} 
                            size={16} 
                            color={selectedStatus === option.value ? getStatusColor(option.value) : '#666'} 
                          />
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            selectedStatus === option.value && [
                              styles.optionTextSelected,
                              { color: getStatusColor(option.value) }
                            ],
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                      
                      {selectedStatus === option.value && (
                        <View style={[styles.activeIndicator, { backgroundColor: getStatusColor(option.value) + '15' }]}>
                          <Icon name="checkmark" size={16} color={getStatusColor(option.value)} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Clear Filter Option */}
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    handleSelect('');
                    setModalVisible(false);
                  }}
                >
                  <Icon name="close-circle-outline" size={18} color="#666" />
                  <Text style={styles.clearButtonText}>Clear Filter</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Smaller filter button (matches search bar height ~52px)
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12.5,    // Match the SearchBar input padding
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 44,
    height: 45,             // Match SearchBar height
  },
  chevronIcon: {
    marginLeft: 2,         // Reduced spacing
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 320,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  activeFilterContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginBottom: 12,
  },
  optionsList: {
    maxHeight: 280,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionSelected: {
    backgroundColor: '#f5f5f5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  activeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default FilterDropdown;