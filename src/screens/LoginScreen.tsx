import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../api/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../api/firebase';
import { Ionicons } from '@expo/vector-icons';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-1 px-6 justify-center">
        {/* Header */}
        <View className="mb-12 items-center">
          <View className="items-center mb-6">
            <Image
              source={require('../../assets/off-roader-logo.jpg')}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text className="text-gray-600 text-center">
            {isSignUp ? 'Join the Off Roader Up community' : 'Sign in to your Off Roader Up account'}
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {/* Email Input */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <View className="relative">
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-gray-50"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color="#9CA3AF" 
                style={{ position: 'absolute', right: 12, top: 12 }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <View className="relative">
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-900 bg-gray-50"
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1"
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Auth Button */}
        <Pressable
          onPress={handleAuth}
          disabled={isLoading || !email || !password}
          className={`mt-8 py-4 rounded-lg items-center justify-center ${
            isLoading || !email || !password ? 'bg-gray-300' : 'bg-blue-500'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </Pressable>

        {/* Toggle Auth Mode */}
        <View className="mt-6 items-center">
          <Pressable
            onPress={() => setIsSignUp(!isSignUp)}
            className="py-2"
          >
            <Text className="text-blue-500 font-medium">
              {isSignUp ? 'Already have an account? Sign In' : 'New here? Create Account'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}