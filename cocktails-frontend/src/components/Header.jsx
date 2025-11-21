import { Link } from 'react-router-dom';
import { getFavoritesCount } from '../utils/favorites';
import { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
    const [favCount, setFavCount] = useState(0);

    useEffect(() => {
      //Se actualiza favoritos
        const updateCount = () => {
            setFavCount(getFavoritesCount());
        };

        updateCount();

        window.addEventListener('favoritesChanged', updateCount);

        return () => {
            window.removeEventListener('favoritesChanged', updateCount);
        };
    }, []);

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                     Cocktails App
                </Link>

                <nav className="nav">
                    <Link to="/" className="nav-link">
                        Inicio
                    </Link>
                    <Link to="/favorites" className="nav-link">
                         Favoritos ({favCount})
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;