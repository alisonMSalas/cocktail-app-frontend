import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCocktails } from '../services/cocktailService';
import { getFavorites, toggleFavorite, isFavorite } from '../utils/favorites';
import './Favorites.css';

const Favorites = () => {
    const [favoriteCocktails, setFavoriteCocktails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFavorites();

        // Escuchar cambios en favoritos
        const handleFavoritesChange = () => {
            loadFavorites();
        };

        window.addEventListener('favoritesChanged', handleFavoritesChange);

        return () => {
            window.removeEventListener('favoritesChanged', handleFavoritesChange);
        };
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const favoriteIds = getFavorites();

            if (favoriteIds.length === 0) {
                setFavoriteCocktails([]);
                setLoading(false);
                return;
            }

            // Obtener todos los cócteles y filtrar los favoritos
            const allCocktails = await getAllCocktails();
            const favorites = allCocktails.filter((cocktail) =>
                favoriteIds.includes(cocktail.id)
            );

            // Limpiar favoritos que ya no existen (IDs huérfanos)
            const validFavoriteIds = favorites.map(cocktail => cocktail.id);
            const invalidIds = favoriteIds.filter(id => !validFavoriteIds.includes(id));
            
            if (invalidIds.length > 0) {
                // Actualizar localStorage solo con IDs válidos
                const validFavorites = favoriteIds.filter(id => validFavoriteIds.includes(id));
                localStorage.setItem('cocktail_favorites', JSON.stringify(validFavorites));
                
                // Disparar evento para actualizar el contador en el header
                window.dispatchEvent(new Event('favoritesChanged'));
            }

            setFavoriteCocktails(favorites);
            setError(null);
        } catch (err) {
            setError('Error al cargar los favoritos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = (cocktailId) => {
        toggleFavorite(cocktailId);
        window.dispatchEvent(new Event('favoritesChanged'));
        // Recargar favoritos
        loadFavorites();
    };

    if (loading) {
        return <div className="loading">Cargando favoritos...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="favorites-container">
            <h1>Mis Cócteles Favoritos</h1>

            {favoriteCocktails.length === 0 ? (
                <div className="no-favorites">
                    <p>No tienes cócteles favoritos aún</p>
                    <p className="subtitle">
                        Marca tus cócteles favoritos haciendo clic en la estrella
                    </p>
                    <Link to="/" className="btn-primary">
                        Explorar cócteles
                    </Link>
                </div>
            ) : (
                <div className="favorites-grid">
                    {favoriteCocktails.map((cocktail) => (
                        <div key={cocktail.id} className="favorite-card">
                            <div className="card-image">
                                {cocktail.image_url ? (
                                    <img
                                        src={`http://localhost:3000${cocktail.image_url}`}
                                        alt={cocktail.name}
                                    />
                                ) : (
                                    <div className="no-image">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                                            <path d="M12 22V12M7 12l5-3 5 3"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="card-content">
                                <h3>{cocktail.name}</h3>
                                {cocktail.category && (
                                    <span className="category-badge">
                                        {cocktail.category.name}
                                    </span>
                                )}
                                <p className="description">
                                    {cocktail.description || 'Sin descripción'}
                                </p>

                                <div className="card-actions">
                                    <Link
                                        to={`/cocktail/${cocktail.id}`}
                                        className="btn-secondary"
                                    >
                                        Ver detalle
                                    </Link>
                                    <button
                                        onClick={() => handleToggleFavorite(cocktail.id)}
                                        className="btn-favorite active"
                                        title="Quitar de favoritos"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;