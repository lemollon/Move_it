import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (file, options = {}) => {
  const {
    folder = 'move-it',
    resourceType = 'auto',
    publicId = null,
    transformation = null,
    allowedFormats = null,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
  } = options;

  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn('Cloudinary not configured - using mock upload');
    return mockUpload(file, options);
  }

  const uploadOptions = {
    folder,
    resource_type: resourceType,
    ...(publicId && { public_id: publicId }),
    ...(transformation && { transformation }),
    ...(allowedFormats && { allowed_formats: allowedFormats }),
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        } else {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            createdAt: result.created_at,
          });
        }
      }
    );

    // Handle buffer or base64
    if (Buffer.isBuffer(file)) {
      streamifier.createReadStream(file).pipe(uploadStream);
    } else if (typeof file === 'string') {
      // Base64 string
      const buffer = Buffer.from(file.replace(/^data:.*?;base64,/, ''), 'base64');
      streamifier.createReadStream(buffer).pipe(uploadStream);
    } else {
      reject(new Error('Invalid file format - must be Buffer or base64 string'));
    }
  });
};

/**
 * Upload image with optimizations
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with optimized URLs
 */
export const uploadImage = async (file, options = {}) => {
  const result = await uploadToCloudinary(file, {
    ...options,
    resourceType: 'image',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'],
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  // Generate thumbnail URL
  const thumbnailUrl = cloudinary.url(result.publicId, {
    width: 200,
    height: 200,
    crop: 'thumb',
    quality: 'auto',
    fetch_format: 'auto',
  });

  return {
    ...result,
    thumbnailUrl,
  };
};

/**
 * Upload document (PDF, etc.)
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadDocument = async (file, options = {}) => {
  return uploadToCloudinary(file, {
    ...options,
    resourceType: 'raw',
    folder: options.folder || 'move-it/documents',
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('Cloudinary not configured - skipping delete');
    return { result: 'ok' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Generate signed URL for private resources
 * @param {string} publicId - Public ID of the resource
 * @param {Object} options - URL generation options
 * @returns {string} - Signed URL
 */
export const getSignedUrl = (publicId, options = {}) => {
  const {
    resourceType = 'image',
    expiresAt = Math.floor(Date.now() / 1000) + 3600, // 1 hour
  } = options;

  return cloudinary.url(publicId, {
    sign_url: true,
    resource_type: resourceType,
    type: 'authenticated',
    expires_at: expiresAt,
    ...options,
  });
};

/**
 * Get transformation URL
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} - Transformed URL
 */
export const getTransformedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    transformation: transformations,
    fetch_format: 'auto',
    quality: 'auto',
  });
};

/**
 * Mock upload for development without Cloudinary credentials
 * @param {Buffer|string} file - File data
 * @param {Object} options - Upload options
 * @returns {Object} - Mock upload result
 */
const mockUpload = (file, options = {}) => {
  const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const size = Buffer.isBuffer(file) ? file.length : file.length * 0.75; // Approximate base64 size

  console.log('=== MOCK CLOUDINARY UPLOAD ===');
  console.log('Mock ID:', mockId);
  console.log('Folder:', options.folder || 'move-it');
  console.log('Size:', Math.round(size / 1024), 'KB');
  console.log('===============================');

  return {
    publicId: mockId,
    url: `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/${mockId}`,
    format: 'jpg',
    resourceType: 'image',
    bytes: size,
    width: 800,
    height: 600,
    createdAt: new Date().toISOString(),
    thumbnailUrl: `https://res.cloudinary.com/demo/image/upload/c_thumb,w_200,h_200/${mockId}`,
  };
};

/**
 * Cloudinary service object for easier importing
 */
export const cloudinaryService = {
  upload: uploadToCloudinary,
  uploadImage,
  uploadDocument,
  delete: deleteFromCloudinary,
  getSignedUrl,
  getTransformedUrl,
};

export default cloudinaryService;
