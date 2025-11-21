const FAVORITES_KEY = 'cocktail_favorites';

// Obtener todos los favoritos
export const getFavorites = () => {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
};

// Verificar si un cóctel es favorito
export const isFavorite = (cocktailId) => {
    const favorites = getFavorites();
    return favorites.includes(cocktailId);
};

// Agregar a favoritos
export const addToFavorites = (cocktailId) => {
    const favorites = getFavorites();
    
    if (!favorites.includes(cocktailId)) {
        favorites.push(cocktailId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
    }
    
    return false;
};

// Quitar de favoritos
export const removeFromFavorites = (cocktailId) => {
    const favorites = getFavorites();
    const filtered = favorites.filter(id => id !== cocktailId);
    
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
};


export const toggleFavorite = (cocktailId) => {
    if (isFavorite(cocktailId)) {
        removeFromFavorites(cocktailId);
        return false; // Ya no es favorito
    } else {
        addToFavorites(cocktailId);
        return true; // Ahora es favorito
    }
};

// Obtener cantidad de favoritos
export const getFavoritesCount = () => {
    return getFavorites().length;
};

// Limpiar todos los favoritos
export const clearFavorites = () => {
    localStorage.removeItem(FAVORITES_KEY);
};

// Limpiar favoritos inválidos (IDs que no existen en la lista de cócteles)
export const cleanInvalidFavorites = async (getAllCocktailsFn) => {
    try {
        const favoriteIds = getFavorites();
        if (favoriteIds.length === 0) return;

        const allCocktails = await getAllCocktailsFn();
        const validIds = allCocktails.map(cocktail => cocktail.id);
        const validFavorites = favoriteIds.filter(id => validIds.includes(id));

        if (validFavorites.length !== favoriteIds.length) {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(validFavorites));
            window.dispatchEvent(new Event('favoritesChanged'));
            return true; // Se limpiaron favoritos
        }
        return false; // No había favoritos inválidos
    } catch (err) {
        console.error('Error limpiando favoritos inválidos:', err);
        return false;
    }
};