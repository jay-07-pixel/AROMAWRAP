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

// Sign up new user
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Create user document in Firestore
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

// Create or update admin in Firestore
export const createOrUpdateAdmin = async (
  email: string,
  password: string,
  uid: string
): Promise<void> => {
  try {
    const adminDoc = {
      email,
      password, // Note: In production, you should hash this or use Firebase Admin SDK
      uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Store in admin collection with email as document ID
    await setDoc(doc(db, ADMIN_COLLECTION, email.toLowerCase()), adminDoc, { merge: true });
    
    // Also store in admin collection with uid as document ID for easy lookup
    await setDoc(doc(db, ADMIN_COLLECTION, uid), adminDoc, { merge: true });
  } catch (error) {
    console.error('Error creating/updating admin:', error);
    throw error;
  }
};

// Initialize admin account (creates admin in Firebase Auth if doesn't exist)
export const initializeAdmin = async (): Promise<void> => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '123456';
    
    // Try to sign in first to check if admin exists
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('Admin account already exists');
    } catch (error: any) {
      // If user doesn't exist, create it
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          const user = userCredential.user;
          
          // Update profile
          await updateProfile(user, { displayName: 'Admin' });
          
          // Create admin profile
          const adminProfile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            displayName: 'Admin',
            role: 'admin',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };
          
          await setDoc(doc(db, USERS_COLLECTION, user.uid), adminProfile);
          
          // Store in admin collection
          await createOrUpdateAdmin(adminEmail, adminPassword, user.uid);
          
          console.log('Admin account created successfully');
        } catch (createError) {
          console.error('Error creating admin account:', createError);
          // If creation fails, admin might already exist or there's another issue
        }
      } else {
        console.error('Error checking admin account:', error);
      }
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Sign in user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    // Check if this is admin login attempt
    const isAdmin = email.toLowerCase() === 'admin@gmail.com' && password === '123456';
    
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      // If admin account doesn't exist, create it
      if (isAdmin && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        try {
          // Create admin account
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;
          
          // Update profile
          await updateProfile(newUser, { displayName: 'Admin' });
          
          // Create admin profile
          const adminProfile: UserProfile = {
            uid: newUser.uid,
            email: newUser.email!,
            displayName: 'Admin',
            role: 'admin',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };
          
          await setDoc(doc(db, USERS_COLLECTION, newUser.uid), adminProfile);
          
          // Store in admin collection
          await createOrUpdateAdmin(email, password, newUser.uid);
          
          return newUser;
        } catch (createError: any) {
          console.error('Error creating admin account:', createError);
          throw createError;
        }
      } else {
        throw error;
      }
    }
    
    const user = userCredential.user;
    
    // If admin login, store credentials and update role
    if (isAdmin) {
      // Store admin credentials in Firestore admin collection
      await createOrUpdateAdmin(email, password, user.uid);
      
      // Update user profile to have admin role
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        // Update existing profile
        await updateUserProfile(user.uid, { role: 'admin' });
      } else {
        // Create new admin profile
        const adminProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: 'Admin',
          role: 'admin',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        await setDoc(doc(db, USERS_COLLECTION, user.uid), adminProfile);
      }
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
    
    // If this is the first address, make it default
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

