import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import YmbLockup from './YmbLockup';

export default function Navbar({ currentPage }) {
    const { url } = usePage();

    // Detect current page from URL if not passed as prop
    const getCurrentPage = () => {
        if (currentPage) return currentPage;
        
        if (url === '/') return 'home';
        if (url.includes('about')) return 'about';
        if (url.includes('services')) return 'services';
        if (url.includes('faq')) return 'faq';
        if (url.includes('login')) return 'login';
        if (url.includes('sign up') || url.includes('signup')) return 'signup';
        return 'home';
    };

    const activePage = getCurrentPage();

    const navLinks = [
        { name: 'Home', href: '/', key: 'home' },
        { name: 'About', href: '/about', key: 'about' },
        { name: 'FAQs', href: '/faq', key: 'faq' },
    ];

    const isActive = (key) => activePage === key;

    return (
        <nav className="flex justify-between items-center px-10 py-4 bg-card shadow-md border-b border-border sticky top-0 z-50">

            {/* LEFT SIDE — LOGO */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
                    <YmbLockup size="sm" showTagline={false} />
            </Link>

            {/* RIGHT SIDE — NAVIGATION */}
            <div className="flex items-center gap-8">

                {/* NAV LINKS */}
                <div className="flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.key}
                            href={link.href}
                            className={`relative px-4 py-2 font-semibold transition-all duration-300 group ${
                                isActive(link.key)
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-primary'
                            }`}
                        >
                            {link.name}
                            {/* Animated underline */}
                            <span
                                className={`absolute bottom-0 left-0 h-1 bg-primary rounded-full transition-all duration-300 ${
                                    isActive(link.key) ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}
                            />
                        </Link>
                    ))}
                </div>

                {/* DYNAMIC BUTTON: Added fixed width (w-28) and text-center to prevent shifting */}
                {activePage === 'login' ? (
                    <Link href="/signup" className="cursor-pointer inline-block">
                        <button className="w-28 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer text-center">
                            Sign Up
                        </button>
                    </Link>
                ) : (
                    <Link href="/login" className="cursor-pointer inline-block">
                        <button className="w-28 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer text-center">
                            Login
                        </button>
                    </Link>
                )}
                
            </div>
        </nav>
    );
}