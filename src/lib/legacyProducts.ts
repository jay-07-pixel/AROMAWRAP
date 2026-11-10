/** Legacy local-only product ids from pre-API admin flow — not valid in MySQL. */
export function isLegacyProductId(id: string): boolean {
  return id.startsWith("PROD-");
}

/** Remove stale client-side product caches from before the Express/MySQL migration. */
export function clearLegacyProductStorage(): void {
  try {
    localStorage.removeItem("adminProducts");
    localStorage.removeItem("recentlyViewed");
  } catch {
    /* ignore */
  }
}
