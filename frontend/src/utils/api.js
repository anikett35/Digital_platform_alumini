const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Returns a proper profile image URL.
 * Handles absolute URLs, relative paths, and missing images.
 */
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  // Relative path — prepend API base
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const getApiBaseUrl = () => API_BASE_URL;

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default {
  getProfileImageUrl,
  getApiBaseUrl,
  getApiUrl
};
