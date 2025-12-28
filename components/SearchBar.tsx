// components/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  value?: string;
  placeholder?: string;
  delay?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  value = '',
  placeholder = 'Search tasks...',
  delay = 500 
}) => {
  const [localQuery, setLocalQuery] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  
  // Track if input was focused before update
  const wasFocusedRef = useRef(false);
  
  // Check focus state before update
  useEffect(() => {
    if (inputRef.current) {
      wasFocusedRef.current = inputRef.current.isFocused();
    }
  }, [value]);
  
  // Update local state when the value prop changes
  useEffect(() => {
    setLocalQuery(value);
    
    // Restore focus if input was focused before and we still have text
    if (wasFocusedRef.current && inputRef.current && value) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [value]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleQueryChange = (text: string) => {
    setLocalQuery(text);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debouncing
    timeoutRef.current = setTimeout(() => {
      onSearch(text);
    }, delay);
  };

  return (
    <View style={styles.container}>
      <Icon name="search" size={20} color="#999" style={styles.icon} />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={localQuery}
        onChangeText={handleQueryChange}
        clearButtonMode="while-editing"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default SearchBar;