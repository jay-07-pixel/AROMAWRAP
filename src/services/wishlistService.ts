import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  badge?: string;
}

const WISHLIST_COLLECTION = 'wishlists';

// Get user's wishlist from Firestore
export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const wishlistRef = doc(db, WISHLIST_COLLECTION, userId);
    const wishlistSnap = await getDoc(wishlistRef);
    
    if (wishlistSnap.exists()) {
      const data = wishlistSnap.data();
      return data.items || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
};

// Save wishlist to Firestore
export const saveWishlist = async (userId: string, items: WishlistItem[]): Promise<void> => {
  try {
    const wishlistRef = doc(db, WISHLIST_COLLECTION, userId);
    await setDoc(wishlistRef, {
      items,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving wishlist:', error);
    throw error;
  }
};

// Clear wishlist in Firestore
export const clearUserWishlist = async (userId: string): Promise<void> => {
  try {
    const wishlistRef = doc(db, WISHLIST_COLLECTION, userId);
    await setDoc(wishlistRef, {
      items: [],
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};


