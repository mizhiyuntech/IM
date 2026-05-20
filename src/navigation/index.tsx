import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Spacing, FontSize } from '../theme';
import { useAppContext } from '../context/AppContext';
import LoginScreen from '../screens/Login/LoginScreen';
import ChatListScreen from '../screens/ChatList/ChatListScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ContactsScreen from '../screens/Contacts/ContactsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { Text, StyleSheet } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Chat: { conversationId: string; conversationName: string };
};

export type MainTabParamList = {
  ChatList: undefined;
  Contacts: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabScreenOptions = ({
  route,
}: {
  route: { name: string };
}) => ({
  tabBarIcon: ({ focused }: { focused: boolean }) => {
    const icons: Record<string, string> = {
      ChatList: '\u{1F4AC}',
      Contacts: '\u{1F4C7}',
      Profile: '\u{1F464}',
    };
    return (
      <Text
        style={[
          styles.tabIcon,
          { color: focused ? Colors.primary : Colors.tabInactive },
        ]}>
        {icons[route.name] || ''}
      </Text>
    );
  },
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.tabInactive,
  tabBarLabelStyle: styles.tabLabel,
  tabBarStyle: styles.tabBar,
  headerStyle: { backgroundColor: Colors.white },
  headerTitleStyle: styles.headerTitle,
  headerShadowVisible: false,
  headerTintColor: Colors.textPrimary,
});

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: '消息', headerTitle: '消息' }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ title: '通讯录', headerTitle: '通讯录' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: '我的', headerTitle: '我的' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { state } = useAppContext();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!state.isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({
                headerShown: true,
                headerTitle: route.params.conversationName,
                headerTitleStyle: styles.headerTitle,
                headerTintColor: Colors.textPrimary,
                headerStyle: { backgroundColor: Colors.white },
                headerShadowVisible: false,
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: FontSize.sm,
  },
  tabBar: {
    paddingBottom: Spacing.xs,
    height: 56,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
});
