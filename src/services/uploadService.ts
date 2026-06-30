import { apiFetch } from "@/lib/api";

type ProductUploadResponse = {
  success: true;
  data: Array<{ url: string }>;
};

type ProfileUploadResponse = {
  success: true;
  data: { url: string };
};

type DeleteUploadResponse = {
  success: true;
  data: { url: string };
};

function isProfileFolder(folder: string): boolean {
  return folder === "users" || folder === "profile";
}

async function uploadProductFiles(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await apiFetch<ProductUploadResponse>(
    "/api/uploads/products",
    {
      method: "POST",
      body: formData,
    }
  );

  return response.data.map((item) => item.url);
}

export const uploadProductImage = async (
  file: File,
  _productId?: string
): Promise<string> => {
  try {
    const urls = await uploadProductFiles([file]);
    return urls[0];
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

export const uploadProductImages = async (
  files: File[],
  _productId?: string
): Promise<string[]> => {
  try {
    return await uploadProductFiles(files);
  } catch (error) {
    console.error("Error uploading product images:", error);
    throw error;
  }
};

export const uploadUserProfileImage = async (
  file: File,
  _userId?: string
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiFetch<ProfileUploadResponse>(
      "/api/uploads/profile",
      {
        method: "POST",
        body: formData,
      }
    );

    return response.data.url;
  } catch (error) {
    console.error("Error uploading user profile image:", error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    await apiFetch<DeleteUploadResponse>("/api/uploads/products", {
      method: "DELETE",
      body: JSON.stringify({ url: imageUrl }),
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

export const uploadImage = async (
  file: File,
  folder: string = "products",
  _filename?: string
): Promise<string> => {
  try {
    if (isProfileFolder(folder)) {
      return await uploadUserProfileImage(file);
    }

    const urls = await uploadProductFiles([file]);
    return urls[0];
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const uploadMultipleImages = async (
  files: File[],
  folder: string = "products"
): Promise<string[]> => {
  try {
    if (isProfileFolder(folder)) {
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await uploadUserProfileImage(file));
      }
      return urls;
    }

    return await uploadProductFiles(files);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};

export const uploadImageFromURL = async (
  imageUrl: string,
  folder: string = "products",
  filename: string
): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });

    return await uploadImage(file, folder, filename);
  } catch (error) {
    console.error("Error uploading image from URL:", error);
    throw error;
  }
};
