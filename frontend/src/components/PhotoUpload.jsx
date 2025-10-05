import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { api } from '../utils/api';
import OptimizedImage from './OptimizedImage';

const PhotoUpload = ({ photos = [], onPhotosUpdate, maxPhotos = 6 }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Check if user has reached max photos
    if (photos.length >= maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos`);
      return;
    }
    
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await api.post('/user/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        // Update photos list
        onPhotosUpdate(response.data.data.photos);
        console.log('Photo uploaded successfully:', response.data.data.photoUrl);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload photo';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoUrl) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    
    try {
      const response = await api.delete('/user/photos', {
        data: { photoUrl }
      });
      
      if (response.data.success) {
        onPhotosUpdate(response.data.data.photos);
        console.log('Photo deleted successfully');
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Photo delete error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete photo';
      alert(errorMessage);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Photos ({photos.length}/{maxPhotos})
        </h3>
        {photos.length < maxPhotos && (
          <button
            onClick={openFileDialog}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-pink text-white rounded-lg hover:bg-loveRed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera size={16} />
            Add Photo
          </button>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group aspect-square">
            <OptimizedImage
              src={photo}
              alt={`Profile photo ${index + 1}`}
              width={300}
              height={300}
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
            <button
              onClick={() => deletePhoto(photo)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Delete photo"
            >
              <X size={16} />
            </button>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                Main
              </div>
            )}
          </div>
        ))}

        {/* Upload Area */}
        {photos.length < maxPhotos && (
          <div
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-pink bg-pink bg-opacity-10'
                : 'border-gray-300 hover:border-pink hover:bg-gray-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={!uploading ? openFileDialog : undefined}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink"></div>
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload size={32} className="mb-2" />
                <p className="text-sm text-center">
                  Drop photo here or click to upload
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max 5MB, JPG/PNG
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Instructions */}
      {photos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No photos yet</p>
          <p className="text-sm">
            Add some photos to make your profile more attractive!
          </p>
        </div>
      )}

      {photos.length > 0 && photos.length < maxPhotos && (
        <div className="text-center text-sm text-gray-500">
          <p>
            You can add {maxPhotos - photos.length} more photo{maxPhotos - photos.length !== 1 ? 's' : ''}.
            Your first photo will be your main profile picture.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
