import api from './api';

// Obtener todos los ingredientes
export const getAllIngredients = async () => {
    const response = await api.get('/ingredients');
    return response.data;
};

// Crear un nuevo ingrediente
export const createIngredient = async (ingredientData) => {
    const response = await api.post('/ingredients', ingredientData);
    return response.data;
};