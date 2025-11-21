import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCocktailById, deleteCocktail } from '../services/cocktailService';
import { toggleFavorite, isFavorite } from '../utils/favorites';
import CocktailModal from '../components/CocktailModal';
import './CocktailDetail.css';

const CocktailDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cocktail, setCocktail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorite, setFavorite] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadCocktail();
    }, [id]);

   const loadCocktail = async () => {
    try {
        setLoading(true);
        const data = await getCocktailById(id);
        console.log('Datos del cóctel recibidos:', data);
        console.log('Ingredientes:', data.cocktailIngredients);
        setCocktail(data);
        setFavorite(isFavorite(data.id));
        setError(null);
    } catch (err) {
        setError('Error al cargar el cóctel');
        console.error(err);
    } finally {
        setLoading(false);
    }
};

    const handleToggleFavorite = () => {
        const newFavoriteState = toggleFavorite(cocktail.id);
        setFavorite(newFavoriteState);
        window.dispatchEvent(new Event('favoritesChanged'));
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de eliminar este cóctel?')) {
            try {
                await deleteCocktail(id);
                navigate('/');
            } catch (err) {
                alert('Error al eliminar el cóctel');
                console.error(err);
            }
        }
    };

    const handleModalSuccess = () => {
        loadCocktail();
    };

    if (loading) {
        return <div className="loading">Cargando cóctel...</div>;
    }

    if (error || !cocktail) {
        return (
            <div className="error-container">
                <p className="error-message">{error || 'Cóctel no encontrado'}</p>
                <Link to="/" className="btn-primary">
                    Volver al inicio
                </Link>
            </div>
        );
    }

    return (
        <div className="cocktail-detail-container">
            <div className="detail-header">
                <Link to="/" className="back-link">
                    ← Volver
                </Link>
                <div className="header-actions">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-edit"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                    </button>
                    <button onClick={handleDelete} className="btn-delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Eliminar
                    </button>
                    <button
                        onClick={handleToggleFavorite}
                        className={`btn-favorite-detail ${favorite ? 'active' : ''}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {favorite ? 'Favorito' : 'Agregar a favoritos'}
                    </button>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-image">
                    {cocktail.image_url ? (
                        <img
                            src={`http://localhost:3000${cocktail.image_url}`}
                            alt={cocktail.name}
                        />
                    ) : (
                        <div className="no-image-large">
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                                <path d="M12 22V12M7 12l5-3 5 3"/>
                            </svg>
                        </div>
                    )}
                </div>

                <div className="detail-info">
                    <h1>{cocktail.name}</h1>

                    {cocktail.category && (
                        <span className="category-badge-large">
                            {cocktail.category.name}
                        </span>
                    )}

                    {cocktail.description && (
                        <div className="detail-section">
                            <h3>Descripción</h3>
                            <p>{cocktail.description}</p>
                        </div>
                    )}

                    <div className="detail-section">
                        <h3>Ingredientes</h3>
                        {cocktail.cocktailIngredients &&
                        cocktail.cocktailIngredients.length > 0 ? (
                            <ul className="ingredients-list">
                                {cocktail.cocktailIngredients.map((ci) => (
                                    <li key={ci.id}>
                                        <strong>{ci.ingredient.name}</strong> -{' '}
                                        {ci.quantity}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No se especificaron ingredientes</p>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Preparación</h3>
                        <p className="instructions">{cocktail.instructions}</p>
                    </div>
                </div>
            </div>

            <CocktailModal
                isOpen={isModalOpen}
                cocktailId={cocktail.id}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
};

export default CocktailDetail;