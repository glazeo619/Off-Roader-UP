import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, signOut, User } from '../api/firebase';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigation.replace('Login');
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Welcome!</Text>
            <Text className="text-gray-600 mt-1">{user.email}</Text>
          </View>
          <Pressable
            onPress={handleSignOut}
            className="w-10 h-10 bg-red-100 rounded-full items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-8">
        {/* User Info Card */}
        <View className="bg-blue-50 rounded-xl p-6 mb-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
              <Text className="text-white font-bold text-lg">
                {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {user.displayName || 'User'}
              </Text>
              <Text className="text-gray-600">{user.email}</Text>
              <Text className="text-blue-600 text-sm mt-1">ID: {user.uid.slice(-8)}</Text>
            </View>
          </View>
        </View>

        {/* Action Cards */}
        <View className="space-y-4">
          <Pressable className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="person-outline" size={20} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">Profile Settings</Text>
              <Text className="text-gray-600 text-sm">Manage your account details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="settings-outline" size={20} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">App Settings</Text>
              <Text className="text-gray-600 text-sm">Customize your experience</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-4">
              <Ionicons name="help-circle-outline" size={20} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">Help & Support</Text>
              <Text className="text-gray-600 text-sm">Get assistance and FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Footer */}
        <View className="mt-8 pt-6 border-t border-gray-200">
          <Text className="text-center text-gray-500 text-sm">
            Successfully authenticated with your Firebase account
          </Text>
        </View>
      </View>
    </View>
  );
}