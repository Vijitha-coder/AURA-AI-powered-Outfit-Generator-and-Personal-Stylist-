

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WardrobeProvider, useWardrobe } from './context/WardrobeContext';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import WardrobePage from './pages/WardrobePage';
import AddItemPage from './pages/AddItemPage';
import StylistPage from './pages/StylistPage';
import OutfitResultsPage from './pages/OutfitResultsPage';
import ChatPage from './pages/ChatPage';
import RateOutfitPage from './pages/RateOutfitPage';
import LoadingSpinner from './components/LoadingSpinner';

// A small component to render the main layout and consume context
const AppLayout: React.FC = () => {
    const { loading } = useWardrobe();

    return (
        <div className="min-h-screen flex flex-col">
            {loading && <LoadingSpinner message="Working..." />}
            <Header />
            <main className="flex-grow">
                <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/wardrobe" element={<WardrobePage />} />
                    <Route path="/wardrobe/new" element={<AddItemPage />} />
                    <Route path="/stylist" element={<StylistPage />} />
                    <Route path="/stylist/results" element={<OutfitResultsPage />} />
                    <Route path="/rate-outfit" element={<RateOutfitPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
        </div>
    );
}

const App: React.FC = () => {
  return (
    <WardrobeProvider>
        <HashRouter>
            <AppLayout />
        </HashRouter>
    </WardrobeProvider>
  );
};

export default App;