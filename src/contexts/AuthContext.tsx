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
  savedPrompts: string[];
  savePrompt: (prompt: string) => void;
  deletePrompt: (prompt: string) => void;
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
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);

  // Load saved prompts from localStorage on user change
  useEffect(() => {
    if (currentUser && currentUser.email) {
      try {
        const storedPrompts = localStorage.getItem(`savedPrompts_${currentUser.email}`);
        if (storedPrompts) {
          setSavedPrompts(JSON.parse(storedPrompts));
        } else {
          setSavedPrompts([]); // Clear if no stored prompts for this user
        }
      } catch (e) {
        console.error("Failed to load saved prompts:", e);
        setSavedPrompts([]);
      }
    } else {
      setSavedPrompts([]); // Clear for logged-out users
    }
  }, [currentUser]);

  // Save prompts to localStorage when they change
  useEffect(() => {
    if (currentUser && currentUser.email) {
      try {
        localStorage.setItem(`savedPrompts_${currentUser.email}`, JSON.stringify(savedPrompts));
      } catch (e) {
        console.error("Failed to save prompts:", e);
      }
    }
  }, [savedPrompts, currentUser]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, newUser => {
      setCurrentUser(oldUser => {
        // When the user's identity changes (login, logout, or switch), clear their session data.
        if (oldUser?.uid !== newUser?.uid) {
            setPromptHistory([]);
            setSavedPrompts([]);
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

  const savePrompt = (prompt: string) => {
    setSavedPrompts(prev => {
        if (prev.includes(prompt)) {
            return prev; // Don't add duplicates
        }
        return [prompt, ...prev];
    });
  };

  const deletePrompt = (promptToDelete: string) => {
    setSavedPrompts(prev => prev.filter(p => p !== promptToDelete));
  };


  const value = {
    currentUser,
    loading,
    signUp,
    logIn,
    logOut,
    promptHistory,
    addPromptToHistory,
    clearPromptHistory,
    savedPrompts,
    savePrompt,
    deletePrompt
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
