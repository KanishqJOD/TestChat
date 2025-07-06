'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/chatbot-fe-main/components/ui/button';

interface ImagePreviewProps {
  images: { url: string; file: File }[];
  onRemove: (index: number) => void;
}

export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
            <Image
              src={image.url}
              alt={`Uploaded image ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
} 