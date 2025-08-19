'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onImageDeleted?: () => void;
  currentImageUrl?: string;
  folder?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  onImageUploaded,
  onImageDeleted,
  currentImageUrl,
  folder = 'products',
  disabled = false,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        onImageUploaded(result.imageUrl);
        toast.showSuccess('Attēls veiksmīgi augšupielādēts');
      } else {
        toast.showError(result.error || 'Kļūda augšupielādējot attēlu');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.showError('Kļūda augšupielādējot attēlu');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImageUrl || !onImageDeleted) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/upload?url=${encodeURIComponent(currentImageUrl)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        onImageDeleted();
        toast.showSuccess('Attēls veiksmīgi izdzēsts');
      } else {
        toast.showError(result.error || 'Kļūda dzēšot attēlu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.showError('Kļūda dzēšot attēlu');
    } finally {
      setDeleting(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {currentImageUrl ? (
        <div className="relative">
          <div className="w-full h-48 rounded-lg border-2 border-gray-200 overflow-hidden">
            <img
              src={currentImageUrl}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={disabled || uploading || deleting}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Augšupielādē...' : 'Mainīt'}
            </button>
            
            {onImageDeleted && (
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={disabled || uploading || deleting}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Dzēš...' : 'Dzēst'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={openFileDialog}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Augšupielādē attēlu...</p>
            </div>
          ) : (
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-2 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Noklikšķiniet, lai augšupielādētu attēlu</p>
              <p className="text-xs text-gray-500">JPEG, PNG vai WebP (maks. 10MB)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}