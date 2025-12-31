# Firestore Security Rules

## Updated Rules for Admin Collection

Copy and paste these rules in **Firebase Console → Firestore Database → Rules**:

### Option 1: Recommended (Secure but Flexible)

This version allows admin operations and handles the case where user document might not exist yet:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        (request.auth.token.email == 'admin@gmail.com' ||
         (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'));
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && 
        (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Admin collection - NEW (allows admin to store credentials)
    match /admin/{adminId} {
      allow read: if isAdmin() || (request.auth != null && request.auth.token.email == 'admin@gmail.com');
      allow write: if isAdmin() || (request.auth != null && request.auth.token.email == 'admin@gmail.com');
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      allow write: if request.auth != null && isAdmin();
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || isAdmin());
    }
    
    // Cart collection
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Wishlist collection
    match /wishlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## How to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`aromawarap`)
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the rules above
6. Click **Publish** button

## What These Rules Do

- **Admin Collection**: Allows admin users to read and write to the `admin` collection
- **Users Collection**: Allows users to create/update their own profile, and admins to update any user
- **Products Collection**: Anyone can read, only admins can write
- **Orders Collection**: Users can read their own orders, admins can read all orders
- **Cart/Wishlist**: Users can only access their own cart/wishlist

### Option 2: Temporary Development Rules (Less Secure)

If Option 1 doesn't work, use these temporarily for development (⚠️ **NOT for production**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Admin collection - Allow authenticated users to write (for initial setup)
    match /admin/{adminId} {
      allow read, write: if request.auth != null && 
        request.auth.token.email == 'admin@gmail.com';
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    // Cart collection
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Wishlist collection
    match /wishlists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Testing

After updating the rules:
1. Try logging in with `admin@gmail.com` / `123456`
2. The admin credentials should be stored in Firestore
3. You should be redirected to the admin dashboard

## Troubleshooting

If you still get permission errors:
1. Make sure you're logged in with `admin@gmail.com`
2. Check Firebase Console → Authentication → Users to verify the account exists
3. Try Option 2 rules temporarily to test
4. Once working, switch back to Option 1 for better security

