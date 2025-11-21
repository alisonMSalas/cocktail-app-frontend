import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCocktails } from '../services/cocktailService';
import { getAllCategories } from '../services/categoryService';
import { getAllIngredients } from '../services/ingredientService';
import { toggleFavorite, isFavorite } from '../utils/favorites';
import CocktailModal from '../components/CocktailModal';
import './CocktailList.css';

const CocktailList = () => {
    const [cocktails, setCocktails] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedIngredient, setSelectedIngredient] = useState('');

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    // Aplicar filtros cuando cambien
    useEffect(() => {
        loadCocktails();
    }, [searchTerm, selectedCategory, selectedIngredient]);

    const loadInitialData = async () => {
        try {
            const [categoriesData, ingredientsData] = await Promise.all([
                getAllCategories(),
                getAllIngredients(),
            ]);
            setCategories(categoriesData);
            setIngredients(ingredientsData);
        } catch (err) {
            console.error('Error cargando datos iniciales:', err);
        }
    };

    const loadCocktails = async () => {
        try {
            setLoading(true);
            const filters = {
                search: searchTerm,
                category: selectedCategory,
                ingredient: selectedIngredient,
            };
            const data = await getAllCocktails(filters);
            setCocktails(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los cócteles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = (cocktailId) => {
        toggleFavorite(cocktailId);
        window.dispatchEvent(new Event('favoritesChanged'));
        setCocktails([...cocktails]);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedIngredient('');
    };

    const handleModalSuccess = () => {
        loadCocktails();
    };

    if (loading && cocktails.length === 0) {
        return <div className="loading">Cargando cócteles...</div>;
    }

    return (
        <div className="cocktail-list-container">
            <div className="filters-section">
                <div className="title-with-button">
                    <h1>Cócteles</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-add-cocktail"
                    >
                        + Agregar Cóctel
                    </button>
                </div>

                <div className="filters">
                    <input
                        type="text"
                        placeholder="Buscar cóctel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedIngredient}
                        onChange={(e) => setSelectedIngredient(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los ingredientes</option>
                        {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                                {ing.name}
                            </option>
                        ))}
                    </select>

                    {(searchTerm || selectedCategory || selectedIngredient) && (
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {cocktails.length === 0 ? (
                <div className="no-results">
                    <p>No se encontraron cócteles</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary"
                    >
                        Crear el primer cóctel
                    </button>
                </div>
            ) : (
                <div className="cocktails-grid">
                    {cocktails.map((cocktail) => (
                        <div key={cocktail.id} className="cocktail-card">
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
                                        className={`btn-favorite ${
                                            isFavorite(cocktail.id) ? 'active' : ''
                                        }`}
                                        title={isFavorite(cocktail.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite(cocktail.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CocktailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default CocktailList;