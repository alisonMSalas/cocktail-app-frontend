import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CocktailList from './pages/CocktailList';
import CocktailDetail from './pages/CocktailDetail';
import Favorites from './pages/Favortites';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<CocktailList />} />
                        <Route path="/cocktail/:id" element={<CocktailDetail />} />
                        <Route path="/favorites" element={<Favorites />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;