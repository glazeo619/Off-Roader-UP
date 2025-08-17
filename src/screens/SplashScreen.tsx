import React, { useEffect, useState } from 'react';
import { View, Image, Text, Dimensions, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  interpolate,
  withRepeat
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}



export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showGetStarted, setShowGetStarted] = useState(false);
  const insets = useSafeAreaInsets();
  
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    logoScale.value = withTiming(1, { duration: 800 });
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    // Text animation after logo
    textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    
    // Show get started button after animations
    setTimeout(() => {
      setShowGetStarted(true);
      buttonOpacity.value = withTiming(1, { duration: 500 });
    }, 2000);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { 
          rotate: `${interpolate(logoScale.value, [0, 1], [180, 0])}deg` 
        }
      ],
      opacity: logoOpacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [
        { translateY: interpolate(textOpacity.value, [0, 1], [20, 0]) }
      ],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [
        { translateY: interpolate(buttonOpacity.value, [0, 1], [30, 0]) }
      ],
    };
  });



  return (
    <View 
      className="flex-1 items-center justify-center"
      style={{ 
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: '#EA580C' // Orange background
      }}
    >
      {/* Background Pattern */}
      <View className="absolute inset-0 opacity-10">
        <View className="flex-1" style={{
          backgroundColor: 'transparent',
        }}>
          {/* Tire track pattern overlay could go here */}
        </View>
      </View>

      {/* Centered Content */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <Animated.View style={[logoAnimatedStyle]} className="items-center justify-center mb-8">
          <Image
            source={require('../../assets/off-roader-logo.jpg')}
            style={{
              width: width * 0.7,
              height: width * 0.7,
              maxWidth: 300,
              maxHeight: 300,
            }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View style={[textAnimatedStyle]} className="items-center mb-12">
          <Text className="text-white text-4xl font-bold text-center mb-4">
            Off Roader Up
          </Text>
          <Text className="text-white text-xl font-semibold text-center mb-4">
            Buy • Sell • Trade
          </Text>
          <Text className="text-white/90 text-lg text-center leading-7 px-4">
            The ultimate marketplace for off-road enthusiasts. Find vehicles, parts, gear, and everything you need for your next adventure.
          </Text>
          
          {/* Feature highlights - no icons, just text */}
          <View className="mt-8 space-y-2">
            <Text className="text-white/80 text-center text-base">
              🚗 Vehicles & Parts
            </Text>
            <Text className="text-white/80 text-center text-base">
              🛠️ Tools & Accessories  
            </Text>
            <Text className="text-white/80 text-center text-base">
              🏕️ Camping & Gear
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Get Started Button */}
      {showGetStarted && (
        <Animated.View style={[buttonAnimatedStyle]} className="absolute bottom-20 left-8 right-8">
          <Pressable
            onPress={onComplete}
            className="bg-white rounded-2xl py-4 px-8 shadow-lg active:scale-95"
          >
            <Text className="text-orange-600 text-lg font-bold text-center">
              Get Started
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Skip Button */}
      {showGetStarted && (
        <Animated.View style={[buttonAnimatedStyle]} className="absolute bottom-8">
          <Pressable onPress={onComplete} className="py-2 px-4">
            <Text className="text-white/80 text-sm text-center">
              Skip Introduction
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}