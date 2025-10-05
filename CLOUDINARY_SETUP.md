# Cloudinary Photo Upload Setup Guide

## 🚀 Quick Setup

### 1. Create Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. After signup, go to your Dashboard

### 2. Get Your Credentials
From your Cloudinary Dashboard, copy:
- **Cloud Name** (e.g., `demo`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Update Environment Variables
Edit `/backend/.env` and replace the placeholder values:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name_here
CLOUDINARY_API_KEY=your_actual_api_key_here
CLOUDINARY_API_SECRET=your_actual_api_secret_here
```

### 4. Restart Backend Server
After updating the .env file, restart your backend server:
```bash
# In the backend directory
pnpm run dev
```

## 📸 Features Implemented

### Backend Features
- ✅ **Photo Upload API**: `POST /api/user/photos`
- ✅ **Photo Delete API**: `DELETE /api/user/photos`
- ✅ **Photo List API**: `GET /api/user/photos`
- ✅ **Automatic Image Optimization**: Resizes to 800x800, converts to WebP
- ✅ **File Validation**: 5MB limit, image files only
- ✅ **Error Handling**: Comprehensive error responses

### Frontend Features
- ✅ **Drag & Drop Upload**: Drag images directly onto upload area
- ✅ **Click to Upload**: Traditional file picker
- ✅ **Photo Grid**: Visual display of uploaded photos
- ✅ **Delete Photos**: Remove photos with confirmation
- ✅ **Upload Progress**: Loading indicators during upload
- ✅ **Validation**: Client-side file type and size validation

## 🔧 API Endpoints

### Upload Photo
```http
POST /api/user/photos
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData with 'photo' field containing image file
```

### Delete Photo
```http
DELETE /api/user/photos
Content-Type: application/json
Authorization: Bearer <token>

Body: { "photoUrl": "https://res.cloudinary.com/..." }
```

### Get Photos
```http
GET /api/user/photos
Authorization: Bearer <token>
```

## 📱 Usage in Profile Setup

The photo upload component is now integrated into the Profile Setup page:
- Users can upload up to 6 photos
- First photo becomes the main profile picture
- Photos are automatically optimized and stored in Cloudinary
- URLs are saved in MongoDB user documents

## 🔒 Security Features

- **Authentication Required**: All photo endpoints require valid JWT token
- **File Type Validation**: Only image files accepted
- **File Size Limit**: 5MB maximum per image
- **Automatic Cleanup**: Failed uploads are cleaned up from Cloudinary
- **URL Validation**: Photo URLs are validated before saving to database

## 🌟 Free Tier Limits

Cloudinary free tier includes:
- **25 GB** storage
- **25 GB** monthly bandwidth
- **Unlimited** transformations
- **CDN** delivery included

This should be sufficient for thousands of profile photos!

## 🐛 Troubleshooting

### Common Issues

1. **"Upload failed" error**
   - Check your Cloudinary credentials in `.env`
   - Ensure backend server restarted after updating `.env`

2. **"File too large" error**
   - Images must be under 5MB
   - Consider compressing images before upload

3. **"Only image files allowed" error**
   - Only JPG, PNG, WebP files are supported
   - Check file extension and MIME type

### Debug Mode
Set `NODE_ENV=development` in your `.env` file to see detailed error messages.

## 🚀 Next Steps

1. **Get Cloudinary credentials** from your dashboard
2. **Update the .env file** with your actual credentials
3. **Restart the backend server**
4. **Test photo upload** in the Profile Setup page

The photo upload system is now ready to use! 📸
