import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Product {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images?: string[];
  badge?: string;
  category: string;
  features: string[];
  specifications: Record<string, string>;
  rating?: number;
  reviews?: number;
  stock: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const PRODUCTS_COLLECTION = 'products';

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION), 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error getting products by category:', error);
    throw error;
  }
};

// Add new product
export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  try {
    const productData = {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...product,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Search products
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const allProducts = await getAllProducts();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.description.toLowerCase().includes(lowerSearchTerm) ||
      product.category.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};


