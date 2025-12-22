import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { uploadImageToFirebase, uploadMultipleImages } from '@/utils/uploadImages';

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  folder?: string;
}

export const ImageUploader = ({ 
  onUploadComplete, 
  multiple = false,
  folder = 'products' 
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const fileArray = Array.from(files);
      let urls: string[];

      if (multiple) {
        urls = await uploadMultipleImages(fileArray, folder);
      } else {
        const url = await uploadImageToFirebase(fileArray[0], folder);
        urls = [url];
      }

      setUploadedUrls(urls);
      onUploadComplete(urls);
    } catch (err) {
      setError('Failed to upload image(s). Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setUploadedUrls([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          onClick={handleClick}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {multiple ? 'Upload Images' : 'Upload Image'}
            </>
          )}
        </Button>

        {uploadedUrls.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearUpload}
            title="Clear"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>Successfully uploaded {uploadedUrls.length} image(s)</span>
          </div>
          
          <div className="space-y-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <img 
                  src={url} 
                  alt={`Uploaded ${index + 1}`} 
                  className="h-20 w-20 object-cover rounded border"
                />
                <div className="flex-1 text-xs text-muted-foreground break-all">
                  {url}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


