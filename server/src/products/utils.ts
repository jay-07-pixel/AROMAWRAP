export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function buildUniqueSlug(
  name: string,
  findBySlug: (slug: string) => Promise<{ id: string } | null>,
  excludeId?: string
): Promise<string> {
  const base = slugify(name) || "product";
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await findBySlug(slug);
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    slug = `${base}-${counter}`;
    counter += 1;
  }
}
