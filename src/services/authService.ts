import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  addresses?: Array<{
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }>;
  role: 'user' | 'admin';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const USERS_COLLECTION = 'users';
const ADMIN_COLLECTION = 'admin';

const configuredAdminEmail = () =>
  import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase().trim() || '';

export const isAdminUser = (
  email: string | null | undefined,
  profile: UserProfile | null | undefined
): boolean => {
  if (profile?.role === 'admin') return true;
  const adminEmail = configuredAdminEmail();
  return !!adminEmail && email?.toLowerCase() === adminEmail;
};

const syncAdminRecord = async (email: string, uid: string): Promise<void> => {
  const adminDoc = {
    email,
    uid,
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, ADMIN_COLLECTION, email.toLowerCase()), adminDoc, { merge: true });
  await setDoc(doc(db, ADMIN_COLLECTION, uid), adminDoc, { merge: true });
};

const ensureAdminProfile = async (user: User): Promise<void> => {
  const userProfile = await getUserProfile(user.uid);

  if (userProfile) {
    if (userProfile.role !== 'admin') {
      await updateUserProfile(user.uid, { role: 'admin' });
    }
  } else {
    const adminProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || 'Admin',
      role: 'admin',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(doc(db, USERS_COLLECTION, user.uid), adminProfile);
  }

  await syncAdminRecord(user.email!, user.uid);
};

// Sign up new user
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role: 'user',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, USERS_COLLECTION, user.uid), userProfile);

    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (isAdminUser(user.email, null)) {
      await ensureAdminProfile(user);
    }

    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out user
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Add address
export const addAddress = async (
  uid: string,
  address: UserProfile['addresses'][0]
): Promise<void> => {
  try {
    const userProfile = await getUserProfile(uid);
    const addresses = userProfile?.addresses || [];
    
    if (addresses.length === 0) {
      address.isDefault = true;
    }

    addresses.push(address);

    await updateUserProfile(uid, { addresses });
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

// Update address
export const updateAddress = async (
  uid: string,
  index: number,
  address: UserProfile['addresses'][0]
): Promise<void> => {
  try {
    const userProfile = await getUserProfile(uid);
    const addresses = userProfile?.addresses || [];
    
    if (index >= 0 && index < addresses.length) {
      addresses[index] = address;
      await updateUserProfile(uid, { addresses });
    }
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// Delete address
export const deleteAddress = async (uid: string, index: number): Promise<void> => {
  try {
    const userProfile = await getUserProfile(uid);
    const addresses = userProfile?.addresses || [];
    
    if (index >= 0 && index < addresses.length) {
      addresses.splice(index, 1);
      await updateUserProfile(uid, { addresses });
    }
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};
