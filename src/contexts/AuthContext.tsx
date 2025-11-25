import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      setUser(firebaseUser);

      if (!firebaseUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await loadOrCreateUserProfile(firebaseUser);
        setUserProfile(profile);

        const profileRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(profileRef, async (snapshot) => {
          if (!snapshot.exists()) {
            return;
          }

          try {
            const data = snapshot.data() as UserProfile & { createdAt?: any };
            const normalizedCreatedAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
            const controlsSnap = await getDoc(doc(db, 'userControls', firebaseUser.uid));
            const controlsData = controlsSnap.exists() ? controlsSnap.data() : {};

            setUserProfile({
              ...data,
              createdAt: normalizedCreatedAt,
              blockedFromPosting: Boolean(controlsData.blockedFromPosting),
            });
          } catch (error) {
            console.error('Error processing user profile snapshot:', error);
          }
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
      unsubscribe();
    };
  }, []);

  const loadOrCreateUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const profileSnap = await getDoc(profileRef);

    let profileData: UserProfile;

    if (profileSnap.exists()) {
      const data = profileSnap.data() as UserProfile;
      profileData = {
        ...data,
        createdAt: (data.createdAt as unknown as Date)?.toString ? (data.createdAt as unknown as any).toDate?.() ?? data.createdAt : data.createdAt,
      };
    } else {
      profileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous',
        photoURL: firebaseUser.photoURL ?? null,
        inquiries: [],
        createdAt: new Date(),
      };
      await setDoc(profileRef, profileData);
    }

    const controlsSnap = await getDoc(doc(db, 'userControls', firebaseUser.uid));
    const controlsData = controlsSnap.exists() ? controlsSnap.data() : {};

    return {
      ...profileData,
      blockedFromPosting: Boolean(controlsData.blockedFromPosting),
    };
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign-in...');
      console.log('Auth domain:', auth.config.authDomain);
      await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful!');
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await loadOrCreateUserProfile(userCredential.user);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
