import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload a single image to Firebase Storage
 * @param file - The image file to upload
 * @param folder - Folder name in storage (e.g., 'products', 'categories')
 * @param filename - Custom filename (optional)
 * @returns The public download URL
 */
export const uploadImageToFirebase = async (
  file: File,
  folder: string = 'products',
  filename?: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const finalFilename = filename || `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${finalFilename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('File uploaded successfully:', snapshot);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images at once
 * @param files - Array of image files
 * @param folder - Folder name in storage
 * @returns Array of download URLs
 */
export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'products'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file, index) => 
      uploadImageToFirebase(file, folder, `image_${Date.now()}_${index}_${file.name}`)
    );
    
    const urls = await Promise.all(uploadPromises);
    console.log('All images uploaded:', urls);
    
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Upload image from URL (for migrating existing images)
 * @param imageUrl - URL of the existing image
 * @param folder - Folder name in storage
 * @param filename - Custom filename
 * @returns The new Firebase Storage URL
 */
export const uploadImageFromURL = async (
  imageUrl: string,
  folder: string = 'products',
  filename: string
): Promise<string> => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create a File object
    const file = new File([blob], filename, { type: blob.type });
    
    // Upload to Firebase
    return await uploadImageToFirebase(file, folder, filename);
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
};


