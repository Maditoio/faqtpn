"use client";

import React, { useState, useCallback } from "react";
import { Star, X, Upload, Image as ImageIcon } from "lucide-react";
import imageCompression from 'browser-image-compression';

export interface ImageFile {
  id: string;
  file: File | null;
  preview: string;
  isPrimary: boolean;
}

interface ImageUploadProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 15,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.8, // 800KB max per image
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert to JPEG for better compression
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original if compression fails
    }
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (remainingSlots <= 0) {
        alert(`Maximum of ${maxImages} images allowed`);
        return;
      }

      const filesToAdd = fileArray.slice(0, remainingSlots);
      const invalidFiles = filesToAdd.filter(
        (file) => !file.type.startsWith("image/")
      );

      if (invalidFiles.length > 0) {
        alert("Only image files are allowed");
        return;
      }

      setCompressing(true);

      try {
        // Compress all images
        const compressedFiles = await Promise.all(
          filesToAdd.map(file => compressImage(file))
        );

        const newImages: ImageFile[] = compressedFiles.map((file) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: URL.createObjectURL(file),
          isPrimary: images.length === 0, // First image is primary by default
        }));

        onChange([...images, ...newImages]);

        if (filesToAdd.length < fileArray.length) {
          alert(
            `Only ${filesToAdd.length} images added. Maximum of ${maxImages} images allowed.`
          );
        }
      } catch (error) {
        console.error('Error processing images:', error);
        alert('Error processing images. Please try again.');
      } finally {
        setCompressing(false);
      }
    },
    [images, onChange, maxImages]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    
    // If we removed the primary image, make the first remaining image primary
    const removedImage = images.find((img) => img.id === id);
    if (removedImage?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }
    
    onChange(updatedImages);
  };

  const handleSetPrimary = (id: string) => {
    const updatedImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Property Images
          <span className="text-red-500">*</span>
        </label>
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-sm p-8 text-center cursor-pointer
            transition-colors duration-200
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${compressing ? "opacity-50 cursor-wait" : ""}
          `}
        >
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={compressing}
          />
          <label htmlFor="image-upload" className={compressing ? "cursor-wait" : "cursor-pointer"}>
            {compressing ? (
              <>
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Compressing images...
                </p>
                <p className="text-xs text-gray-500">
                  Please wait while we optimize your images
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  Maximum {maxImages} images • JPG, PNG, GIF supported
                </p>
                <p className="text-xs text-green-600 mt-2">
                  ✓ Images automatically compressed for faster upload
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-sm overflow-hidden border-2 border-gray-200"
            >
              <img
                src={image.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />

              {/* Primary Badge */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-sm text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image.id)}
                    className="bg-white text-gray-700 p-2 rounded-sm hover:bg-yellow-500 hover:text-white transition-colors"
                    title="Set as primary"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  className="bg-white text-gray-700 p-2 rounded-sm hover:bg-red-500 hover:text-white transition-colors"
                  title="Remove"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}

      {images.length > 0 && (
        <>
          <p className="text-xs text-gray-500 mb-2">
            Click the star icon to set an image as the primary (poster) image
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>💡 Pro tip:</strong> High-quality images get 3x more inquiries! Upload up to {maxImages} images to showcase your property's best features.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
