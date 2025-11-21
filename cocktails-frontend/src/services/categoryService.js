import api from './api';

// Obtener todas las categorías
export const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

// Crear una nueva categoría
export const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
};