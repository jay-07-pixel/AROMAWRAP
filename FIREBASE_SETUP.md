# Firebase Backend Setup Guide

## 🔥 Overview

Your Firebase backend is now fully configured with the following services:

- **Authentication** - User sign up, sign in, password reset
- **Firestore Database** - Products, Orders, Users collections
- **Cloud Storage** - Image uploads for products and user profiles
- **Analytics** - Track user behavior

## 📁 Project Structure

```
src/
├── lib/
│   └── firebase.ts           # Firebase initialization
├── services/
│   ├── authService.ts        # Authentication functions
│   ├── productService.ts     # Product CRUD operations
│   ├── orderService.ts       # Order management
│   └── storageService.ts     # Image upload/delete
└── context/
    └── AuthContext.tsx       # Auth state management
```

## 🚀 Getting Started

### 1. Wrap Your App with AuthProvider

Update your `src/main.tsx` or `src/App.tsx`:

```tsx
import { AuthProvider } from '@/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 2. Use Authentication in Components

```tsx
import { useAuth } from '@/context/AuthContext';
import { signIn, signUp, logout } from '@/services/authService';

function MyComponent() {
  const { user, userProfile, loading } = useAuth();

  const handleSignUp = async () => {
    try {
      await signUp('user@example.com', 'password123', 'John Doe');
      // User is automatically signed in
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn('user@example.com', 'password123');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {userProfile?.displayName}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleSignUp}>Sign Up</button>
          <button onClick={handleSignIn}>Sign In</button>
        </div>
      )}
    </div>
  );
}
```

## 📦 Product Management

### Add a Product

```tsx
import { addProduct } from '@/services/productService';

const newProduct = {
  name: 'Lavender Incense',
  price: 349,
  originalPrice: 449,
  description: 'Premium lavender incense sticks',
  image: 'https://...',
  images: ['https://...', 'https://...'],
  category: 'incense',
  badge: 'New',
  features: ['100% Natural', 'Long Burning'],
  specifications: {
    'Pack Size': '20 Sticks',
    'Burning Time': '60 minutes'
  },
  stock: 100
};

const productId = await addProduct(newProduct);
```

### Get All Products

```tsx
import { getAllProducts } from '@/services/productService';

const products = await getAllProducts();
```

### Update a Product

```tsx
import { updateProduct } from '@/services/productService';

await updateProduct('productId', {
  price: 299,
  stock: 50
});
```

## 🛒 Order Management

### Create an Order

```tsx
import { createOrder } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();

const newOrder = {
  userId: user!.uid,
  items: [
    {
      productId: 'prod-1',
      name: 'Lavender',
      price: 349,
      quantity: 2,
      image: 'https://...'
    }
  ],
  total: 698,
  status: 'pending',
  shippingAddress: {
    name: 'John Doe',
    phone: '9876543210',
    address: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  },
  paymentMethod: 'cod',
  paymentStatus: 'pending'
};

const orderId = await createOrder(newOrder);
```

### Get User Orders

```tsx
import { getUserOrders } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const orders = await getUserOrders(user!.uid);
```

## 📸 Image Upload

### Upload Product Image

```tsx
import { uploadProductImage } from '@/services/storageService';

const handleImageUpload = async (file: File, productId: string) => {
  try {
    const imageUrl = await uploadProductImage(file, productId);
    console.log('Image uploaded:', imageUrl);
    // Use this URL when adding/updating product
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Upload Multiple Images

```tsx
import { uploadProductImages } from '@/services/storageService';

const handleMultipleUpload = async (files: File[], productId: string) => {
  try {
    const imageUrls = await uploadProductImages(files, productId);
    console.log('Images uploaded:', imageUrls);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## 🔒 Firebase Security Rules

### Firestore Rules

Add these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Storage Rules

Add these rules in Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Product images
    match /products/{allPaths=**} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User profile images
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 📊 Firestore Collections Structure

### Users Collection (`users`)
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  phone?: string,
  photoURL?: string,
  addresses?: Array<{
    name: string,
    phone: string,
    address: string,
    city: string,
    state: string,
    pincode: string,
    isDefault?: boolean
  }>,
  role: 'user' | 'admin',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Products Collection (`products`)
```typescript
{
  name: string,
  price: number,
  originalPrice?: number,
  description: string,
  image: string,
  images?: string[],
  badge?: string,
  category: string,
  features: string[],
  specifications: Record<string, string>,
  rating?: number,
  reviews?: number,
  stock: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Orders Collection (`orders`)
```typescript
{
  userId: string,
  items: Array<{
    productId: string,
    name: string,
    price: number,
    quantity: number,
    image: string
  }>,
  total: number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  shippingAddress: {
    name: string,
    phone: string,
    address: string,
    city: string,
    state: string,
    pincode: string
  },
  paymentMethod: 'cod' | 'online',
  paymentStatus: 'pending' | 'paid' | 'failed',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🎯 Next Steps

1. **Set up Firebase Security Rules** (see above)
2. **Create admin user** in Firebase Console → Authentication
3. **Add admin role** to user document in Firestore
4. **Test authentication** flow
5. **Import existing products** to Firestore
6. **Configure payment gateway** (if using online payments)

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check Firebase Security Rules
   - Verify user is authenticated
   - Check user role for admin operations

2. **Image Upload Fails**
   - Check Storage Security Rules
   - Verify file size (max 5MB recommended)
   - Check file type is allowed

3. **Authentication Errors**
   - Enable Email/Password in Firebase Console → Authentication → Sign-in methods
   - Check network connection

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Storage](https://firebase.google.com/docs/storage)

---

✅ **Firebase backend is ready to use!**


