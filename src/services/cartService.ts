import { doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CART_COLLECTION = 'carts';

// Get user's cart from Firestore
export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    const cartSnap = await getDoc(cartRef);
    
    if (cartSnap.exists()) {
      const data = cartSnap.data();
      return data.items || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

// Save cart to Firestore
export const saveCart = async (userId: string, items: CartItem[]): Promise<void> => {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    await setDoc(cartRef, {
      items,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

// Clear cart in Firestore
export const clearUserCart = async (userId: string): Promise<void> => {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    await setDoc(cartRef, {
      items: [],
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};


