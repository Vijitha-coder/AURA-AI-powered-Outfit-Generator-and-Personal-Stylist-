
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-accent-primary/20 text-accent-primary'
        : 'text-text-secondary hover:text-text-primary hover:bg-card'
    }`;

  return (
    <header className="bg-background/80 backdrop-blur-lg sticky top-0 z-40 border-b border-accent-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/dashboard" className="flex items-center space-x-2 text-2xl font-bold text-accent-primary transition-opacity hover:opacity-80">
                <Sparkles className="h-6 w-6" />
                <span>Aura</span>
            </NavLink>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/wardrobe" className={navLinkClass}>My Wardrobe</NavLink>
                <NavLink to="/stylist" className={navLinkClass}>AI Stylist</NavLink>
                <NavLink to="/rate-outfit" className={navLinkClass}>Rate My Outfit</NavLink>
                <NavLink to="/chat" className={navLinkClass}>Chat</NavLink>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-card transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;