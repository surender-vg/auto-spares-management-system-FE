const API_URL = import.meta.env.VITE_API_URL || '';
export default API_URL;

export const getImageUrl = (img) => {
    if (!img) return '/placeholder.png';
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    return `${API_URL}${img}`;
};
