const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/default-avatar.png';
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `/`;
};

export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/`;
  return ``;
};

if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    exampleImageUrl: getProfileImageUrl('/uploads/profiles/test.jpg'),
    exampleApiUrl: getApiUrl('/api/auth/profile')
  });
}

export default {
  getProfileImageUrl,
  getApiBaseUrl,
  getApiUrl
};
