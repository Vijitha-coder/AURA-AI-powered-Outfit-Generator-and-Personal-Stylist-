

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WardrobeProvider, useWardrobe } from './context/WardrobeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
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
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/wardrobe" element={<ProtectedRoute><WardrobePage /></ProtectedRoute>} />
                    <Route path="/wardrobe/new" element={<ProtectedRoute><AddItemPage /></ProtectedRoute>} />
                    <Route path="/stylist" element={<ProtectedRoute><StylistPage /></ProtectedRoute>} />
                    <Route path="/stylist/results" element={<ProtectedRoute><OutfitResultsPage /></ProtectedRoute>} />
                    <Route path="/rate-outfit" element={<ProtectedRoute><RateOutfitPage /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    
                    {/* Redirect root to login or dashboard */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </main>
        </div>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WardrobeProvider>
          <HashRouter>
              <AppLayout />
          </HashRouter>
      </WardrobeProvider>
    </AuthProvider>
  );
};

export default App;