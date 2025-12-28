import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function AppLayout() {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/(auth)/login');
  };

  return (
    <Stack>
      <Stack.Screen
        name="tasks/index"
        options={{
          title: 'My Tasks',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
              <Icon name="log-out-outline" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="tasks/[id]" options={{ title: 'Task Details' }} />
      <Stack.Screen name="tasks/create" options={{ title: 'Create Task' }} />
    </Stack>
  );
}