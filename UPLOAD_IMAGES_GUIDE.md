# 📸 Upload Images to Firebase Storage

## Why Upload Images to Firebase?

When you launch your website, images need to be stored in a public cloud storage so anyone can access them. Firebase Storage provides:

- ✅ **Public Access** - Anyone can view your product images
- ✅ **Fast CDN** - Images load quickly worldwide
- ✅ **Reliable** - 99.9% uptime
- ✅ **Scalable** - Handle unlimited images
- ✅ **Secure** - Control who can upload/delete

## 🚀 Quick Start

### Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **aromawarap**
3. Click **Storage** in the left menu
4. Click **Get Started**
5. Choose **Start in production mode** (we'll set rules later)
6. Select your preferred location (e.g., `asia-south1` for India)
7. Click **Done**

### Step 2: Set Storage Security Rules

In Firebase Console → Storage → Rules, paste this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Anyone can read images
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Only authenticated users can upload
    match /products/{allPaths=**} {
      allow write: if request.auth != null;
    }
    
    match /categories/{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

Click **Publish** to save.

## 📤 How to Upload Images

### Method 1: Using the Image Uploader Component (Recommended)

I've created a ready-to-use component for you:

```tsx
import { ImageUploader } from '@/components/ImageUploader';

function MyComponent() {
  const handleUpload = (urls: string[]) => {
    console.log('Uploaded image URLs:', urls);
    // Use these URLs in your product data
  };

  return (
    <div>
      <h3>Upload Product Image</h3>
      <ImageUploader 
        onUploadComplete={handleUpload}
        folder="products"
        multiple={false}
      />
    </div>
  );
}
```

**For multiple images:**

```tsx
<ImageUploader 
  onUploadComplete={handleUpload}
  folder="products"
  multiple={true}  // Allow multiple files
/>
```

### Method 2: Programmatically Upload

```tsx
import { uploadImageToFirebase } from '@/utils/uploadImages';

// Upload from file input
const handleFileUpload = async (file: File) => {
  try {
    const url = await uploadImageToFirebase(file, 'products');
    console.log('Image URL:', url);
    // Save this URL to your product data
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Upload multiple files
import { uploadMultipleImages } from '@/utils/uploadImages';

const handleMultipleUpload = async (files: File[]) => {
  try {
    const urls = await uploadMultipleImages(files, 'products');
    console.log('Image URLs:', urls);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Method 3: Migrate Existing Images from URLs

```tsx
import { uploadImageFromURL } from '@/utils/uploadImages';

// Upload existing image from public/products/ to Firebase
const migrateImage = async () => {
  try {
    const localUrl = '/products/lavender.jpg';
    const firebaseUrl = await uploadImageFromURL(
      window.location.origin + localUrl,
      'products',
      'lavender.jpg'
    );
    console.log('New Firebase URL:', firebaseUrl);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
```

## 🔄 Complete Workflow

### For New Products:

1. **Upload Image** using ImageUploader component
2. **Get Firebase URL** from the callback
3. **Create Product** with the Firebase URL:

```tsx
import { addProduct } from '@/services/productService';
import { ImageUploader } from '@/components/ImageUploader';
import { useState } from 'react';

function AddProductForm() {
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = (urls: string[]) => {
    setImageUrl(urls[0]);
  };

  const handleSubmit = async () => {
    const product = {
      name: 'Lavender Incense',
      price: 349,
      originalPrice: 449,
      description: 'Premium lavender incense',
      image: imageUrl, // Firebase URL
      category: 'incense',
      features: ['100% Natural'],
      specifications: { 'Pack Size': '20 Sticks' },
      stock: 100
    };

    await addProduct(product);
    console.log('Product added successfully!');
  };

  return (
    <div>
      <ImageUploader onUploadComplete={handleImageUpload} />
      
      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Preview" className="w-32 h-32" />
          <button onClick={handleSubmit}>Save Product</button>
        </div>
      )}
    </div>
  );
}
```

## 📁 Folder Structure in Firebase Storage

```
storage/
├── products/           # Product images
│   ├── lavender.jpg
│   ├── mogra.jpg
│   └── ...
├── categories/         # Category images
│   ├── agarbatti.jpg
│   └── ...
└── users/             # User profile images
    └── ...
```

## 🎯 Best Practices

### 1. **Optimize Images Before Upload**
- Resize to appropriate dimensions (800x800px recommended)
- Compress to reduce file size (use tools like TinyPNG)
- Use WebP format for better compression

### 2. **Use Descriptive Filenames**
```tsx
// Good
uploadImageToFirebase(file, 'products', 'lavender-incense-pack-20.jpg');

// Bad
uploadImageToFirebase(file, 'products', 'img123.jpg');
```

### 3. **Handle Errors Gracefully**
```tsx
try {
  const url = await uploadImageToFirebase(file, 'products');
  // Success!
} catch (error) {
  // Show error to user
  alert('Failed to upload image. Please try again.');
}
```

### 4. **Show Upload Progress**
The ImageUploader component already shows loading state!

## 🔧 Troubleshooting

### "Permission Denied"
- Make sure you're signed in
- Check Storage Rules in Firebase Console
- Verify the folder path is correct

### "File Too Large"
- Firebase free tier: max 5GB total storage
- Compress images before upload
- Consider paid plan for more storage

### "Network Error"
- Check internet connection
- Verify Firebase config is correct
- Check browser console for errors

## 📝 Example: Complete Admin Page for Adding Products

Create `src/pages/AdminAddProduct.tsx`:

```tsx
import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { addProduct } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AdminAddProduct = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (urls: string[]) => {
    setImageUrl(urls[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addProduct({
        name,
        price: Number(price),
        description: '',
        image: imageUrl,
        category: 'incense',
        features: [],
        specifications: {},
        stock: 0
      });

      alert('Product added successfully!');
      // Reset form
      setName('');
      setPrice('');
      setImageUrl('');
    } catch (error) {
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Product Image</label>
          <ImageUploader onUploadComplete={handleImageUpload} />
        </div>

        <div>
          <label className="block mb-2">Product Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Price</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={!imageUrl || loading}>
          {loading ? 'Adding...' : 'Add Product'}
        </Button>
      </form>
    </div>
  );
};
```

## ✅ Next Steps

1. **Enable Firebase Storage** (see Step 1 above)
2. **Set Security Rules** (see Step 2 above)
3. **Upload your existing images** using the ImageUploader
4. **Update your product data** with Firebase URLs
5. **Test** that images load correctly

---

🔥 **Your images will now be publicly accessible from anywhere in the world!**


