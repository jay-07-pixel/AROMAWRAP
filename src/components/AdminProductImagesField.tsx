import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { uploadProductImages } from "@/services/uploadService";

export type ProductImageItem = {
  id: string;
  preview: string;
  file?: File;
  url?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function createImageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createProductImageItemsFromUrls(urls: string[]): ProductImageItem[] {
  return urls.filter(Boolean).map((url, index) => ({
    id: `existing-${index}-${url}`,
    preview: url,
    url,
  }));
}

export async function resolveProductImageUrls(
  items: ProductImageItem[]
): Promise<string[]> {
  const files = items.filter((item) => item.file).map((item) => item.file!);
  const uploaded = files.length > 0 ? await uploadProductImages(files) : [];

  const urls: string[] = [];
  let uploadIndex = 0;

  for (const item of items) {
    if (item.url) {
      urls.push(item.url);
    } else if (item.file) {
      urls.push(uploaded[uploadIndex]);
      uploadIndex += 1;
    }
  }

  return urls;
}

function validateImageFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    toast({
      title: "Error",
      description: "Each image must be less than 5MB",
      variant: "destructive",
    });
    return false;
  }

  if (!file.type.startsWith("image/")) {
    toast({
      title: "Error",
      description: "Please upload valid image files only",
      variant: "destructive",
    });
    return false;
  }

  return true;
}

interface AdminProductImagesFieldProps {
  images: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
  required?: boolean;
  title?: string;
  description?: string;
}

export function AdminProductImagesField({
  images,
  onChange,
  required = true,
  title = "Product Images",
  description = "Upload one or more high-quality images",
}: AdminProductImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const nextItems: ProductImageItem[] = [];

    for (const file of Array.from(fileList)) {
      if (!validateImageFile(file)) continue;
      nextItems.push({
        id: createImageId(),
        preview: URL.createObjectURL(file),
        file,
      });
    }

    if (nextItems.length > 0) {
      onChange([...images, ...nextItems]);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    onChange(images.filter((image) => image.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#DC143C]" />
            {title}
            {required && <span className="text-[#DC143C]">*</span>}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="border-[#DC143C] text-[#DC143C]">
          {images.length} {images.length === 1 ? "image" : "images"}
        </Badge>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50"
            >
              <img
                src={image.preview}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              {index === 0 && (
                <Badge className="absolute top-2 left-2 bg-[#DC143C] text-white text-xs">
                  Main
                </Badge>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => removeImage(image.id)}
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#DC143C] transition-colors">
        <label htmlFor="admin-product-images-input" className="cursor-pointer block">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground mb-1 font-semibold">
            {images.length > 0 ? "Add more images" : "Click to upload images"}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP up to 5MB each. First image is the main product image.
          </p>
          <Input
            ref={inputRef}
            id="admin-product-images-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
        </label>
      </div>
    </div>
  );
}
