import React from 'react';
import { Sparkles, Layout, CreditCard, LogIn, BarChart3, Settings2 } from 'lucide-react';

interface WelcomeStateProps {
    onSuggestionClick: (prompt: string) => void;
}

const suggestions = [
    { label: 'Login Screen', icon: <LogIn size={12} />, prompt: 'Create a modern mobile login screen with email and password fields, a "Sign In" button, and social login options.' },
    { label: 'Dashboard', icon: <BarChart3 size={12} />, prompt: 'Create a modern analytics dashboard with a sidebar, metric cards, and a line chart area.' },
    { label: 'Pricing Table', icon: <CreditCard size={12} />, prompt: 'Create a pricing table with 3 tiers: Free, Pro, and Enterprise, with feature comparison.' },
    { label: 'Settings Page', icon: <Settings2 size={12} />, prompt: 'Create a settings page with account info, notification toggles, and a theme selector.' },
    { label: 'Card Component', icon: <Layout size={12} />, prompt: 'Create a product card with an image area, title, description, price, and an "Add to Cart" button.' },
];

export function WelcomeState({ onSuggestionClick }: WelcomeStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full px-6 py-8 gap-6 select-none">
            {/* Icon */}
            <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-figma-bg-brand flex items-center justify-center shadow-lg shadow-figma-bg-brand/20">
                    <Sparkles className="w-6 h-6 text-figma-text-onbrand" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-figma-bg animate-pulse" />
            </div>

            {/* Text */}
            <div className="text-center space-y-1.5">
                <h2 className="text-figma-12 font-semibold text-figma-text">What do you want to build?</h2>
                <p className="text-[10px] text-figma-text-secondary leading-relaxed max-w-[220px]">
                    Describe a UI and I'll generate editable Figma layers with Auto Layout.
                </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[280px]">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => onSuggestionClick(s.prompt)}
                        className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-figma-border bg-figma-bg hover:bg-figma-bg-hover hover:border-figma-border-brand text-[10px] font-medium text-figma-text-secondary hover:text-figma-text-brand transition-all duration-150"
                    >
                        <span className="text-figma-icon-secondary group-hover:text-figma-icon-brand transition-colors">{s.icon}</span>
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
