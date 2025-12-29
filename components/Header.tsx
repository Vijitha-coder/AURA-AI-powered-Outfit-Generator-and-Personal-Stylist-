
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
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
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/wardrobe" className={navLinkClass}>My Wardrobe</NavLink>
            <NavLink to="/stylist" className={navLinkClass}>AI Stylist</NavLink>
            <NavLink to="/rate-outfit" className={navLinkClass}>Rate My Outfit</NavLink>
            <NavLink to="/chat" className={navLinkClass}>Chat</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;