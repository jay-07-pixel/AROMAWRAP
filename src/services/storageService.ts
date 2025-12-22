import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Upload product image
export const uploadProductImage = async (
  file: File,
  productId: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `${productId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `products/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

// Upload multiple product images
export const uploadProductImages = async (
  files: File[],
  productId: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadProductImage(file, productId));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading product images:', error);
    throw error;
  }
};

// Upload user profile image
export const uploadUserProfileImage = async (
  file: File,
  userId: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `users/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading user profile image:', error);
    throw error;
  }
};

// Delete image
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};


