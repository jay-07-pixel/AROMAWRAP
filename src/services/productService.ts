import { ApiError } from "@/lib/api";
import {
  createProductApi,
  deleteProductApi,
  fetchProductById,
  fetchProductBySlug,
  fetchProducts,
  updateProductApi,
  type ApiProduct,
  type CreateProductRequest,
  type ListProductsParams,
  type ProductPagination,
  type ProductSort,
  type UpdateProductRequest,
} from "@/services/apiProductService";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images?: string[];
  badge?: string;
  category: string;
  slug?: string;
  features: string[];
  specifications: Record<string, string>;
  rating?: number;
  reviews?: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  category?: string;
  slug?: string;
}

export interface ProductListResult {
  items: ProductListItem[];
  pagination: ProductPagination;
}

function getImageUrls(product: ApiProduct): string[] {
  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const urls = sorted.map((image) => image.imageUrl).filter(Boolean);

  if (urls.length > 0) {
    return urls;
  }

  if (product.image) {
    return [product.image];
  }

  return ["/placeholder.svg"];
}

function mapProductImages(
  product: Pick<Product, "image" | "images">
): CreateProductRequest["images"] {
  const imageUrls =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  return imageUrls
    .filter(Boolean)
    .map((imageUrl, index) => ({ imageUrl, sortOrder: index }));
}

function mapProductToCreateInput(
  product: Omit<Product, "id">
): CreateProductRequest {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    badge: product.badge ?? null,
    stock: product.stock,
    rating: product.rating ?? null,
    reviewsCount: product.reviews ?? null,
    images: mapProductImages(product),
  };
}

function mapPartialProductToUpdateInput(
  product: Partial<Product>
): UpdateProductRequest {
  const body: UpdateProductRequest = {};

  if (product.name !== undefined) body.name = product.name;
  if (product.slug !== undefined) body.slug = product.slug;
  if (product.description !== undefined) body.description = product.description;
  if (product.category !== undefined) body.category = product.category;
  if (product.price !== undefined) body.price = product.price;
  if (product.originalPrice !== undefined) {
    body.originalPrice = product.originalPrice ?? null;
  }
  if (product.badge !== undefined) body.badge = product.badge ?? null;
  if (product.stock !== undefined) body.stock = product.stock;
  if (product.rating !== undefined) body.rating = product.rating ?? null;
  if (product.reviews !== undefined) body.reviewsCount = product.reviews ?? null;

  if (product.images !== undefined || product.image !== undefined) {
    body.images = mapProductImages({
      image: product.image ?? "",
      images: product.images,
    });
  }

  return body;
}

export function mapApiProductToListItem(product: ApiProduct): ProductListItem {
  const images = getImageUrls(product);

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    image: images[0],
    badge: product.badge ?? undefined,
    category: product.category,
    slug: product.slug,
  };
}

export function mapApiProductToDetail(product: ApiProduct): Product {
  const images = getImageUrls(product);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    originalPrice: product.originalPrice ?? undefined,
    description: product.description,
    image: images[0],
    images,
    badge: product.badge ?? undefined,
    category: product.category,
    stock: product.stock,
    rating: product.rating ?? 0,
    reviews: product.reviewsCount ?? 0,
    features: [],
    specifications: {},
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function mapUiSortToApiSort(
  sortBy: string
): ProductSort {
  switch (sortBy) {
    case "price-low":
      return "price-low";
    case "price-high":
      return "price-high";
    case "name-asc":
      return "name-asc";
    case "newest":
      return "newest";
    default:
      return "newest";
  }
}

export async function listProducts(
  params: ListProductsParams = {}
): Promise<ProductListResult> {
  const data = await fetchProducts(params);

  return {
    items: data.items.map(mapApiProductToListItem),
    pagination: data.pagination,
  };
}

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { items } = await listProducts({ page: 1, limit: 100 });
    const details = await Promise.all(
      items.map((item) => getProductById(item.id))
    );
    return details.filter((product): product is Product => product !== null);
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const product = await fetchProductById(id);
    return mapApiProductToDetail(product);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return null;
    }
    console.error("Error getting product:", error);
    throw error;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const product = await fetchProductBySlug(slug);
    return mapApiProductToDetail(product);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return null;
    }
    console.error("Error getting product by slug:", error);
    throw error;
  }
};

export const getProduct = async (identifier: string): Promise<Product | null> => {
  const byId = await getProductById(identifier);
  if (byId) return byId;
  return getProductBySlug(identifier);
};

export const getProductsByCategory = async (
  category: string,
  options: Omit<ListProductsParams, "category"> = {}
): Promise<ProductListItem[]> => {
  try {
    const { items } = await listProducts({
      ...options,
      category,
      page: options.page ?? 1,
      limit: options.limit ?? 100,
    });
    return items;
  } catch (error) {
    console.error("Error getting products by category:", error);
    throw error;
  }
};

export const searchProducts = async (
  searchTerm: string,
  options: Omit<ListProductsParams, "search"> = {}
): Promise<ProductListItem[]> => {
  try {
    const { items } = await listProducts({
      ...options,
      search: searchTerm,
      page: options.page ?? 1,
      limit: options.limit ?? 100,
    });
    return items;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

export const addProduct = async (
  product: Omit<Product, "id">
): Promise<string> => {
  try {
    const created = await createProductApi(mapProductToCreateInput(product));
    return created.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Product>
): Promise<void> => {
  try {
    await updateProductApi(id, mapPartialProductToUpdateInput(product));
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await deleteProductApi(id);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getFirestoreProductById = async (
  id: string
): Promise<Product | null> => {
  return getProductById(id);
};
