# Debugging Orders Not Showing

## Quick Checks

1. **Open Browser Console** (F12) and check for:
   - "Loading orders for user: [userId]" - confirms the function is called
   - "Orders loaded: [array]" - shows what data was fetched
   - Any error messages

2. **Check Firestore Console**:
   - Go to Firebase Console → Firestore Database
   - Check if `orders` collection exists
   - Verify orders have `userId` field matching logged-in user's UID
   - Check if orders have `createdAt` timestamp

3. **Check Firestore Security Rules**:
   - Make sure rules allow users to read their own orders:
   ```javascript
   match /orders/{orderId} {
     allow read: if request.auth != null && 
       (resource.data.userId == request.auth.uid || isAdmin());
   }
   ```

4. **Check Firestore Index**:
   - If you see "index required" error in console
   - Click the link in the error to create the index
   - Or create manually: Collection: `orders`, Fields: `userId` (Ascending), `createdAt` (Descending)

## Common Issues

### Issue 1: Missing Firestore Index
**Error**: `The query requires an index`
**Solution**: Click the link in the error message or create index manually in Firebase Console

### Issue 2: Security Rules Blocking
**Error**: `Missing or insufficient permissions`
**Solution**: Update Firestore rules (see FIRESTORE_SECURITY_RULES.md)

### Issue 3: No Orders Created
**Check**: Verify orders are being created when you click "Place Order"
- Check browser console for errors
- Check Firestore console for new documents

### Issue 4: User Not Logged In
**Check**: Make sure `user` object exists in AuthContext
- Check if login was successful
- Verify user.uid exists

## Testing Steps

1. Place a test order:
   - Add items to cart
   - Go to checkout
   - Fill form and place order
   - Check Firestore console for new order document

2. View orders:
   - Go to Account page
   - Click "Orders" tab
   - Check browser console for logs
   - Verify orders appear

3. If still not working:
   - Check browser console for specific error
   - Check Network tab for failed Firestore requests
   - Verify user is logged in (check AuthContext)


