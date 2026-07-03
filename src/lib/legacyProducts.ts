/** Legacy local-only product ids from pre-API admin flow — not valid in MySQL. */
export function isLegacyProductId(id: string): boolean {
  return id.startsWith("PROD-");
}

export function isLegacyProductImage(image?: string): boolean {
  return !!image && image.includes("firebasestorage.googleapis.com");
}

export function isValidStoreProductRef(product: {
  id: string;
  image?: string;
}): boolean {
  return !isLegacyProductId(product.id) && !isLegacyProductImage(product.image);
}

/** Remove stale client-side product caches from before the Express/MySQL migration. */
export function clearLegacyProductStorage(): void {
  try {
    localStorage.removeItem("adminProducts");
  } catch {
    /* ignore */
  }

  try {
    const stored = localStorage.getItem("recentlyViewed");
    if (!stored) return;

    const parsed = JSON.parse(stored) as Array<{ id: string; image?: string }>;
    if (!Array.isArray(parsed)) return;

    const cleaned = parsed.filter(isValidStoreProductRef);
    if (cleaned.length === 0) {
      localStorage.removeItem("recentlyViewed");
    } else if (cleaned.length !== parsed.length) {
      localStorage.setItem("recentlyViewed", JSON.stringify(cleaned));
    }
  } catch {
    localStorage.removeItem("recentlyViewed");
  }
}
