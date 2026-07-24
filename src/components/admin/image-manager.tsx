"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadImage,
  addProductImage,
  removeProductImage,
  type ProductImage,
} from "@/lib/api/products";

interface ImageManagerProps {
  productId: string;
  images: ProductImage[];
  onChange: () => void;
}

export function ImageManager({ productId, images, onChange }: ImageManagerProps) {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      await addProductImage(productId, { url });
      toast.success(t("imageAdded"));
      onChange();
    } catch {
      toast.error(tAuth("genericError"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (imageId: string) => {
    try {
      await removeProductImage(imageId);
      toast.success(t("imageDeleted"));
      onChange();
    } catch {
      toast.error(tAuth("genericError"));
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square overflow-hidden rounded-lg border"
          >
            <Image
              src={image.url}
              alt=""
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              className="absolute right-1 top-1"
              onClick={() => handleRemove(image.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
          <span className="text-xs">
            {isUploading ? t("uploading") : t("uploadImage")}
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}