"use client";

import React, { useState, useRef } from "react";
import { uploadApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Upload, X, RefreshCw, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: "square" | "banner" | "video";
}

export function ImageUpload({
  value,
  onChange,
  folder = "/trymonkmode/uploads",
  label,
  aspectRatio = "banner",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("Image must be smaller than 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadApi.uploadImage(file, folder);
      if (res?.data?.data?.url) {
        onChange(res.data.data.url);
        toast.success("Image uploaded successfully!");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to upload image. Please try again.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square w-24 sm:w-28"
      : aspectRatio === "video"
        ? "aspect-video w-full"
        : "aspect-[21/9] w-full max-h-48";

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-bold text-foreground">{label}</label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-2xl overflow-hidden border border-border bg-muted/40 cursor-pointer group hover:border-primary transition-all ${aspectClass}`}
        >
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs font-semibold hover:bg-white/30 transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-xl bg-rose-500/80 backdrop-blur-md text-white hover:bg-rose-600 transition"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center ${aspectClass}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-primary">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                Click to upload image
              </p>
              <p className="text-[10px] text-muted-foreground">
                PNG, JPG, or WebP (Max 10MB)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
