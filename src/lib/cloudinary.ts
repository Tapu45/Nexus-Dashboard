import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload function
export const uploadToCloudinary = async (
  file: string | Buffer,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: any;
  } = {}
) => {
  try {
    let uploadFile: string;
    if (Buffer.isBuffer(file)) {
      // Default to image/jpeg if resource_type is not specified
      const resourceType = options.resource_type || 'auto';
      let mimeType = 'application/octet-stream';
      if (resourceType === 'image') mimeType = 'image/jpeg';
      else if (resourceType === 'video') mimeType = 'video/mp4';
      else if (resourceType === 'raw') mimeType = 'application/octet-stream';
      uploadFile = `data:${mimeType};base64,${file.toString('base64')}`;
    } else {
      uploadFile = file;
    }

    const result = await cloudinary.uploader.upload(uploadFile, {
      folder: options.folder || 'nexus',
      public_id: options.public_id,
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

// Delete function
export const deleteFromCloudinary = async (public_id: string) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

// Multiple upload function
export const uploadMultipleToCloudinary = async (
  files: (string | Buffer)[],
  options: {
    folder?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
  } = {}
) => {
  try {
    const uploadPromises = files.map((file, index) =>
      uploadToCloudinary(file, {
        ...options,
        public_id: `${options.folder || 'nexus'}_${Date.now()}_${index}`,
      })
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new Error('Failed to upload files to Cloudinary');
  }
};

export default cloudinary;