import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Firebase configuration (matches your provided config)
const firebaseConfig = {
  apiKey: "AIzaSyBgahvYLI1XOD7xJ6od3xaBvj-96q25tCg",
  authDomain: "off-roader-up.firebaseapp.com",
  projectId: "off-roader-up",
  storageBucket: "off-roader-up.appspot.com",
  messagingSenderId: "574121921874",
  appId: "1:574121921874:web:2df16dbdc6f8cb4b8afe8b",
  measurementId: "G-JB27Q0E1BZ"
};

// Mock user type
export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

// Mock auth state management
class Auth {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const userData = await AsyncStorage.getItem('@auth_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  get user() {
    return this.currentUser;
  }
}

// Mock Firestore
class Firestore {
  constructor() {}
  
  // Add basic firestore methods if needed
  collection(path: string) {
    return {
      doc: (id?: string) => ({
        set: (data: any) => Promise.resolve(),
        get: () => Promise.resolve({ exists: false, data: () => null }),
        update: (data: any) => Promise.resolve(),
        delete: () => Promise.resolve(),
      })
    };
  }
}

// Mock Storage
class Storage {
  constructor() {}
  
  ref(path: string) {
    return {
      put: (file: any) => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('') } }),
      getDownloadURL: () => Promise.resolve(''),
      delete: () => Promise.resolve(),
    };
  }
}

// Initialize mock services
export const auth = new Auth();
export const db = new Firestore();
export const storage = new Storage();

// Mock authentication functions
export const signInWithEmailAndPassword = async (authInstance: Auth, email: string, password: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Get stored users
    const usersData = await AsyncStorage.getItem('@auth_users');
    const users = usersData ? JSON.parse(usersData) : {};
    
    // Check if user exists and password matches
    if (users[email] && users[email].password === password) {
      const user: User = {
        uid: users[email].uid,
        email: email,
        displayName: users[email].displayName
      };
      
      // Store current user
      await AsyncStorage.setItem('@auth_user', JSON.stringify(user));
      (authInstance as any).currentUser = user;
      (authInstance as any).notifyListeners();
      
      return { user };
    } else {
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Authentication failed');
  }
};

export const createUserWithEmailAndPassword = async (authInstance: Auth, email: string, password: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Get stored users
    const usersData = await AsyncStorage.getItem('@auth_users');
    const users = usersData ? JSON.parse(usersData) : {};
    
    // Check if user already exists
    if (users[email]) {
      throw new Error('Email already in use');
    }
    
    // Create new user
    const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      uid,
      email,
      displayName: email.split('@')[0]
    };
    
    // Store user data
    users[email] = {
      uid,
      password,
      displayName: user.displayName
    };
    
    await AsyncStorage.setItem('@auth_users', JSON.stringify(users));
    await AsyncStorage.setItem('@auth_user', JSON.stringify(user));
    
    (authInstance as any).currentUser = user;
    (authInstance as any).notifyListeners();
    
    return { user };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Account creation failed');
  }
};

export const signOut = async (authInstance: Auth) => {
  try {
    await AsyncStorage.removeItem('@auth_user');
    (authInstance as any).currentUser = null;
    (authInstance as any).notifyListeners();
  } catch (error) {
    throw new Error('Sign out failed');
  }
};