/** Dhoop sticks are listed as Coming Soon — not for sale yet. */
export function isDhoopCategory(category?: string | null): boolean {
  return (category ?? "").toLowerCase().includes("dhoop");
}

export function isProductPurchasable(category?: string | null): boolean {
  return !isDhoopCategory(category);
}

/** Map category URL slugs to the DB category values used in admin. */
export function resolveCategoryFilter(categoryParam?: string | null): string | undefined {
  if (!categoryParam) return undefined;
  const key = categoryParam.toLowerCase().trim();
  if (key === "agarbatti" || key.includes("agarbatti")) return "Agarbatti";
  if (key === "dhoop" || key.includes("dhoop")) return "Dhoop";
  return categoryParam;
}

/** Pull "Key: Value" lines out of the product description Specs block. */
export function parseSpecifications(description?: string | null): Record<string, string> {
  if (!description) return {};

  const specs: Record<string, string> = {};
  const lines = description.split(/\r?\n/);
  let inSpecs = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^specifications?:?$/i.test(line)) {
      inSpecs = true;
      continue;
    }
    if (inSpecs && /^(features?|description):?$/i.test(line)) {
      break;
    }
    if (!inSpecs && !/^[A-Za-z][A-Za-z\s]+:\s*.+/.test(line)) {
      continue;
    }
    const match = line.match(/^([A-Za-z][A-Za-z\s]+):\s*(.+)$/);
    if (match) {
      inSpecs = true;
      specs[match[1].trim()] = match[2].trim();
    }
  }

  return specs;
}

export function formatWeightLabel(specs: Record<string, string>): string | null {
  const weight = specs.Weight || specs.Weight || specs["Weight"];
  const raw = weight ?? specs["Net Weight"] ?? null;
  if (!raw) return null;
  if (/gm|g\b|gram/i.test(raw)) return raw;
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw} gm`;
  return raw;
}
