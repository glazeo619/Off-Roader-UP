import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  followersCount: number;
  followingCount: number;
}

interface FollowState {
  following: string[]; // User IDs we're following
  followers: string[]; // User IDs following us
  userProfiles: Record<string, UserProfile>;
  
  // Actions
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getFollowersCount: (userId: string) => number;
  getFollowingCount: (userId: string) => number;
  addUserProfile: (profile: UserProfile) => void;
  getUserProfile: (userId: string) => UserProfile | undefined;
}

// Mock user profiles for demo
const mockUserProfiles: Record<string, UserProfile> = {
  'seller1': {
    id: 'seller1',
    name: "Mike's Jeep Parts",
    email: 'mike@jeepparts.com',
    followersCount: 234,
    followingCount: 67
  },
  'seller2': {
    id: 'seller2',
    name: 'John Smith',
    email: 'john@example.com',
    followersCount: 89,
    followingCount: 145
  },
  'seller3': {
    id: 'seller3',
    name: 'Desert Wheels',
    email: 'info@desertwheels.com',
    followersCount: 456,
    followingCount: 23
  },
  'seller4': {
    id: 'seller4',
    name: 'Trail Gear Co',
    email: 'sales@trailgear.com',
    followersCount: 789,
    followingCount: 156
  },
  'seller5': {
    id: 'seller5',
    name: 'Adventure Seeker',
    email: 'adventure@seeker.com',
    followersCount: 123,
    followingCount: 234
  }
};

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      following: [],
      followers: [],
      userProfiles: mockUserProfiles,

      followUser: (userId) => {
        set((state) => {
          if (state.following.includes(userId)) return state;
          
          return {
            following: [...state.following, userId],
            userProfiles: {
              ...state.userProfiles,
              [userId]: state.userProfiles[userId] ? {
                ...state.userProfiles[userId],
                followersCount: state.userProfiles[userId].followersCount + 1
              } : state.userProfiles[userId]
            }
          };
        });
      },

      unfollowUser: (userId) => {
        set((state) => ({
          following: state.following.filter(id => id !== userId),
          userProfiles: {
            ...state.userProfiles,
            [userId]: state.userProfiles[userId] ? {
              ...state.userProfiles[userId],
              followersCount: Math.max(0, state.userProfiles[userId].followersCount - 1)
            } : state.userProfiles[userId]
          }
        }));
      },

      isFollowing: (userId) => {
        return get().following.includes(userId);
      },

      getFollowersCount: (userId) => {
        return get().userProfiles[userId]?.followersCount || 0;
      },

      getFollowingCount: (userId) => {
        return get().userProfiles[userId]?.followingCount || 0;
      },

      addUserProfile: (profile) => {
        set((state) => ({
          userProfiles: {
            ...state.userProfiles,
            [profile.id]: profile
          }
        }));
      },

      getUserProfile: (userId) => {
        return get().userProfiles[userId];
      }
    }),
    {
      name: 'follow-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        following: state.following,
        followers: state.followers
      })
    }
  )
);