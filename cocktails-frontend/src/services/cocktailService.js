import api from './api';

// Obtener todos los cócteles
export const getAllCocktails = async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.ingredient) params.append('ingredient', filters.ingredient);
    
    const response = await api.get(`/cocktails?${params.toString()}`);
    return response.data;
};

// Obtener un cóctel por ID
export const getCocktailById = async (id) => {
    const response = await api.get(`/cocktails/${id}`);
    return response.data;
};

// Crear un nuevo cóctel
export const createCocktail = async (formData) => {
    const response = await api.post('/cocktails', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Actualizar un cóctel
export const updateCocktail = async (id, formData) => {
    const response = await api.put(`/cocktails/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Eliminar un cóctel
export const deleteCocktail = async (id) => {
    const response = await api.delete(`/cocktails/${id}`);
    return response.data;
};