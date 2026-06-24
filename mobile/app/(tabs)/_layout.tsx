import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

function TabIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray200,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Tarefas', tabBarIcon: () => <TabIcon icon="📋" /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: 'Estatísticas', tabBarIcon: () => <TabIcon icon="📊" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: () => <TabIcon icon="👤" /> }}
      />
    </Tabs>
  );
}
