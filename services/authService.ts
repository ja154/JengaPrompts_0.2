// This file provides a mock authentication service to simulate Firebase Auth.
// This is used to avoid errors related to missing API keys in certain environments.

// In-memory store for mock users.
const mockUserDatabase = new Map<string, any>();

// This simulates the user's logged-in state.
let mockUser: any = null;
// This holds the listener function from onAuthStateChanged.
let authStateListener: ((user: any) => void) | null = null;

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
  // Immediately invoke with the current state to simulate initial check.
  setTimeout(() => {
    if (authStateListener) {
      authStateListener(mockUser);
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
const notifyListener = () => {
    if (authStateListener) {
        authStateListener(mockUser);
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
    mockUser = newUser;
    notifyListener();
    resolve({ user: mockUser });
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
    mockUser = mockUserDatabase.get(email);
    notifyListener();
    resolve({ user: mockUser });
  });
};


/**
 * Simulates signing out the current user.
 */
const signOut = (_auth: any) => {
  return new Promise<void>((resolve) => {
    mockUser = null;
    notifyListener();
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