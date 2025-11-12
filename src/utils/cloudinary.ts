const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  console.log('Uploading to Cloudinary:', {
    cloudName: CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET,
    fileName: file.name,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Cloudinary upload error:', errorData);
    throw new Error(`Failed to upload image: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  console.log('Upload successful:', data.secure_url);
  return data.secure_url;
};

export const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};
