import { useState, useEffect } from 'react';
import { getCocktailById, createCocktail, updateCocktail } from '../services/cocktailService';
import { getAllCategories } from '../services/categoryService';
import { getAllIngredients } from '../services/ingredientService';
import './CocktailModal.css';

const CocktailModal = ({ isOpen, cocktailId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        instructions: '',
        category_id: '',
        image: null,
    });
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const isEditMode = !!cocktailId;

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            if (cocktailId) {
                loadCocktailData();
            } else {
                resetForm();
            }
        }
    }, [isOpen, cocktailId]);

    const loadInitialData = async () => {
        try {
            const [categoriesData, ingredientsData] = await Promise.all([
                getAllCategories(),
                getAllIngredients(),
            ]);
            setCategories(categoriesData);
            setIngredients(ingredientsData);
        } catch (err) {
            console.error('Error cargando datos:', err);
        }
    };

    const loadCocktailData = async () => {
        try {
            const data = await getCocktailById(cocktailId);
            setFormData({
                name: data.name,
                description: data.description || '',
                instructions: data.instructions,
                category_id: data.category?.id || '',
                image: null,
            });

            if (data.image_url) {
                setImagePreview(`http://localhost:3000${data.image_url}`);
            }

            if (data.cocktailIngredients) {
                const mappedIngredients = data.cocktailIngredients.map((ci) => ({
                    ingredient_id: ci.ingredient.id,
                    quantity: ci.quantity,
                }));
                setSelectedIngredients(mappedIngredients);
            }
        } catch (err) {
            console.error('Error cargando cóctel:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            instructions: '',
            category_id: '',
            image: null,
        });
        setSelectedIngredients([]);
        setImagePreview(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addIngredient = () => {
        setSelectedIngredients([
            ...selectedIngredients,
            { ingredient_id: '', quantity: '' },
        ]);
    };

    const removeIngredient = (index) => {
        setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
    };

    const updateIngredient = (index, field, value) => {
        const updated = [...selectedIngredients];
        updated[index][field] = value;
        setSelectedIngredients(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.instructions) {
            alert('El nombre y las instrucciones son obligatorios');
            return;
        }

        try {
            setLoading(true);

            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('instructions', formData.instructions);
            
            if (formData.category_id) {
                submitData.append('category_id', formData.category_id);
            }

            if (formData.image) {
                submitData.append('image', formData.image);
            }

            // Agregar ingredientes válidos
            const validIngredients = selectedIngredients.filter(
                (ing) => ing.ingredient_id && ing.quantity
            );

            submitData.append('ingredients', JSON.stringify(validIngredients));

            if (isEditMode) {
                await updateCocktail(cocktailId, submitData);
            } else {
                await createCocktail(submitData);
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error al guardar:', err);
            alert('Error al guardar el cóctel');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? 'Editar Cóctel' : 'Crear Nuevo Cóctel'}</h2>
                    <button className="close-btn" onClick={onClose} title="Cerrar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="name">Nombre *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category_id">Categoría</label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                        >
                            <option value="">Sin categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="instructions">Instrucciones de preparación *</label>
                        <textarea
                            id="instructions"
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleInputChange}
                            rows="5"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Imagen</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input"
                            />
                            <label htmlFor="image" className="file-input-label">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <span>{formData.image ? formData.image.name : 'Seleccionar imagen'}</span>
                            </label>
                            {formData.image && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, image: null }));
                                        setImagePreview(null);
                                        document.getElementById('image').value = '';
                                    }}
                                    className="file-remove-btn"
                                    title="Eliminar imagen"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Ingredientes</label>
                        <div className="ingredients-section">
                            {selectedIngredients.map((ing, index) => (
                                <div key={index} className="ingredient-row">
                                    <select
                                        value={ing.ingredient_id}
                                        onChange={(e) =>
                                            updateIngredient(index, 'ingredient_id', e.target.value)
                                        }
                                    >
                                        <option value="">Seleccionar ingrediente</option>
                                        {ingredients.map((ingredient) => (
                                            <option key={ingredient.id} value={ingredient.id}>
                                                {ingredient.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Cantidad (ej: 50ml)"
                                        value={ing.quantity}
                                        onChange={(e) =>
                                            updateIngredient(index, 'quantity', e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeIngredient(index)}
                                        className="btn-remove-ingredient"
                                        title="Eliminar ingrediente"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="18" y1="6" x2="6" y2="18"/>
                                            <line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="btn-add-ingredient"
                            >
                                + Agregar ingrediente
                            </button>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading
                                ? 'Guardando...'
                                : isEditMode
                                ? 'Actualizar'
                                : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CocktailModal;