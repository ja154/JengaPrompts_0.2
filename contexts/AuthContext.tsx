import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    auth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from '../services/authService';

// Define a User interface compatible with the mock user object and 
// the Firebase User properties that are used throughout the application.
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    creationTime?: string;
  };
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  logIn: (email: string, password: string) => Promise<any>;
  logOut: () => Promise<void>;
  promptHistory: string[];
  addPromptToHistory: (prompt: string) => void;
  clearPromptHistory: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, newUser => {
      setCurrentUser(oldUser => {
        // When the user's identity changes (login, logout, or switch), clear their session data.
        if (oldUser?.uid !== newUser?.uid) {
            setPromptHistory([]);
        }
        return newUser;
      });
      setLoading(false);
    });
    return unsubscribe;
  }, []);
  
  const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const logIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const logOut = () => {
    return firebaseSignOut(auth);
  }

  const addPromptToHistory = (prompt: string) => {
    setPromptHistory(prevHistory => {
        const newHistory = [prompt, ...prevHistory];
        return newHistory.slice(0, 5); // Keep only the last 5 prompts
    });
  };

  const clearPromptHistory = () => {
    setPromptHistory([]);
  };

  const value = {
    currentUser,
    loading,
    signUp,
    logIn,
    logOut,
    promptHistory,
    addPromptToHistory,
    clearPromptHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};