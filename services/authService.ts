// This file provides a mock authentication service to simulate Firebase Auth.
// This is used to avoid errors related to missing API keys in certain environments.

// Use localStorage to persist the user database across refreshes for a better dev experience.
const loadUserDatabase = (): Map<string, any> => {
    try {
        const stored = localStorage.getItem('mockUserDatabase');
        if (stored) {
            // The map is stored as an array of [key, value] pairs.
            return new Map(JSON.parse(stored));
        }
    } catch (e) {
        console.error("Failed to load mock user database from localStorage", e);
    }
    return new Map<string, any>();
};

const saveUserDatabase = (db: Map<string, any>) => {
    try {
        // Convert Map to an array of [key, value] pairs for JSON serialization.
        localStorage.setItem('mockUserDatabase', JSON.stringify(Array.from(db.entries())));
    } catch (e) {
        console.error("Failed to save mock user database to localStorage", e);
    }
};

// In-memory store for mock users, persisted in localStorage.
const mockUserDatabase = loadUserDatabase();

// This holds the listener function from onAuthStateChanged.
let authStateListener: ((user: any) => void) | null = null;

// Use localStorage to keep track of the logged-in user across sessions.
const MOCK_AUTH_SESSION_KEY = 'mockAuthUserEmail';


/**
 * A fake user object that mimics the structure of a Firebase User.
 * This structure is based on the properties used within the application.
 */
const createMockUser = (email: string, displayName?: string, photoURL?: string) => ({
  uid: `mock-${Math.random().toString(36).substr(2, 9)}`,
  email,
  displayName: displayName || email.split('@')[0],
  photoURL: photoURL || `https://i.pravatar.cc/150?u=${email}`,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toUTCString(),
    lastSignInTime: new Date().toUTCString(),
  },
});

// The mock auth object. It's not really used by the mock functions but
// is exported for consistency with the original Firebase implementation.
const auth = {};

/**
 * Simulates onAuthStateChanged. It accepts a callback that will be
 * invoked whenever the mock authentication state changes.
 */
const onAuthStateChanged = (_auth: any, callback: (user: any) => void) => {
  authStateListener = callback;
  // Immediately invoke with the current session state to simulate initial check.
  setTimeout(() => {
    try {
        const userEmail = localStorage.getItem(MOCK_AUTH_SESSION_KEY);
        const user = userEmail ? mockUserDatabase.get(userEmail) : null;
        if (authStateListener) {
            authStateListener(user || null);
        }
    } catch(e) {
        console.error("Could not read from local storage", e);
        if (authStateListener) {
            authStateListener(null);
        }
    }
  }, 0);

  // Return an "unsubscribe" function.
  return () => {
    authStateListener = null;
  };
};

/**
 * Helper to notify the listener about an auth state change.
 */
const notifyListener = (user: any) => {
    if (authStateListener) {
        authStateListener(user);
    }
}

/**
 * Simulates creating a user with email and password.
 */
const createUserWithEmailAndPassword = (_auth: any, email: string, password: string) => {
  return new Promise((resolve, reject) => {
    if (password.length < 6) {
      return reject(new Error("Mock Auth Error: Password should be at least 6 characters."));
    }
    if (mockUserDatabase.has(email)) {
        return reject(new Error("Mock Auth Error: Email address is already in use by another account."));
    }
    const newUser = createMockUser(email);
    mockUserDatabase.set(email, newUser);
    saveUserDatabase(mockUserDatabase);
    
    localStorage.setItem(MOCK_AUTH_SESSION_KEY, email);
    notifyListener(newUser);
    resolve({ user: newUser });
  });
};

/**
 * Simulates signing in a user with email and password.
 */
const signInWithEmailAndPassword = (_auth: any, email: string, _password: string) => {
  return new Promise((resolve, reject) => {
    if (!mockUserDatabase.has(email)) {
        return reject(new Error("Mock Auth Error: Invalid credentials. Please check your email and password."));
    }
    const user = mockUserDatabase.get(email);
    // On successful sign-in, establish a session.
    localStorage.setItem(MOCK_AUTH_SESSION_KEY, email);
    notifyListener(user);
    resolve({ user: user });
  });
};


/**
 * Simulates signing out the current user.
 */
const signOut = (_auth: any) => {
  return new Promise<void>((resolve) => {
    localStorage.removeItem(MOCK_AUTH_SESSION_KEY);
    notifyListener(null);
    resolve();
  });
};


export { 
    auth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};