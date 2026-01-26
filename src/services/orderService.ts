import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const ORDERS_COLLECTION = 'orders';

// Create new order
export const createOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
  try {
    const orderData = {
      ...order,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

// Get all orders for a user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    // Try with orderBy first
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
    } catch (orderByError: any) {
      // If orderBy fails (likely missing index), try without it
      if (orderByError.code === 'failed-precondition') {
        const q = query(
          collection(db, ORDERS_COLLECTION),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        // Sort manually by createdAt
        return orders.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() || 0;
          const bTime = b.createdAt?.toMillis() || 0;
          return bTime - aTime;
        });
      }
      throw orderByError;
    }
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Subscribe to user orders for real-time updates
export const subscribeToUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      callback(orders);
    }, (error) => {
      // If orderBy fails, try without it
      if (error.code === 'failed-precondition') {
        const q2 = query(
          collection(db, ORDERS_COLLECTION),
          where('userId', '==', userId)
        );
        const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
          const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Order));
          // Sort manually
          orders.sort((a, b) => {
            const aTime = a.createdAt?.toMillis() || 0;
            const bTime = b.createdAt?.toMillis() || 0;
            return bTime - aTime;
          });
          callback(orders);
        });
        return unsubscribe2;
      }
      console.error('Error subscribing to user orders:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up order subscription:', error);
    // Return a no-op function if subscription fails
    return () => {};
  }
};

// Get all orders (admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (
  id: string, 
  status: Order['status']
): Promise<void> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (
  id: string, 
  paymentStatus: Order['paymentStatus']
): Promise<void> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, {
      paymentStatus,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};


