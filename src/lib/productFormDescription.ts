export function buildProductDescription(formData: {
  description: string;
  features: string;
  packSize: string;
  burningTime: string;
  weight: string;
  ingredients: string;
}): string {
  const parts: string[] = [];

  if (formData.description.trim()) {
    parts.push(formData.description.trim());
  }

  const features = formData.features
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);

  if (features.length > 0) {
    parts.push(
      `\n\nFeatures:\n${features.map((feature) => `• ${feature}`).join("\n")}`
    );
  }

  const specifications: string[] = [];
  if (formData.packSize) specifications.push(`Pack Size: ${formData.packSize}`);
  if (formData.burningTime) specifications.push(`Burning Time: ${formData.burningTime}`);
  if (formData.weight) specifications.push(`Weight: ${formData.weight}`);
  if (formData.ingredients) specifications.push(`Ingredients: ${formData.ingredients}`);

  if (specifications.length > 0) {
    parts.push(`\n\nSpecifications:\n${specifications.join("\n")}`);
  }

  return parts.join("");
}

export function parseProductDescription(description: string): {
  description: string;
  features: string;
  packSize: string;
  burningTime: string;
  weight: string;
  ingredients: string;
} {
  const result = {
    description,
    features: "",
    packSize: "",
    burningTime: "",
    weight: "",
    ingredients: "",
  };

  const featuresIdx = description.indexOf("\n\nFeatures:\n");
  const specsIdx = description.indexOf("\n\nSpecifications:\n");

  if (featuresIdx === -1 && specsIdx === -1) {
    return result;
  }

  const mainEnd = featuresIdx !== -1 ? featuresIdx : specsIdx;
  result.description = description.slice(0, mainEnd).trim();

  if (featuresIdx !== -1) {
    const featuresEnd = specsIdx !== -1 ? specsIdx : description.length;
    const featuresBlock = description
      .slice(featuresIdx + "\n\nFeatures:\n".length, featuresEnd)
      .trim();
    result.features = featuresBlock
      .split("\n")
      .map((line) => line.replace(/^•\s*/, "").trim())
      .filter(Boolean)
      .join("\n");
  }

  if (specsIdx !== -1) {
    const specsBlock = description
      .slice(specsIdx + "\n\nSpecifications:\n".length)
      .trim();
    for (const line of specsBlock.split("\n")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (key === "Pack Size") result.packSize = value;
      else if (key === "Burning Time") result.burningTime = value;
      else if (key === "Weight") result.weight = value;
      else if (key === "Ingredients") result.ingredients = value;
    }
  }

  return result;
}
