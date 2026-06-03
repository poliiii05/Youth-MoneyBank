// resources/js/Components/Layouts/ProfileDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { ChevronDown, User as UserIcon, Settings, LogOut, Sparkles, Star } from 'lucide-react';

export default function ProfileDropdown({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    const getTierDetails = (tier) => {
        const current = Number(tier || 1);
        if (current === 3) return { name: 'Achiever', level: 'Tier 3', color: 'text-indigo-600', bg: 'bg-indigo-50', dot: 'bg-indigo-500' };
        if (current === 2) return { name: 'Builder', level: 'Tier 2', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
        return { name: 'Starter', level: 'Tier 1', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' };
    };

    const tier = getTierDetails(user?.kyc_tier);
    const userName = user?.name || 'User';
    const userInitial = userName.charAt(0).toUpperCase();
    const profilePic = user?.profile_picture;

    const handleLogout = (e) => {
        e.preventDefault();
        setIsOpen(false);
        if (!confirm('Sign out of Youth MoneyBank?')) return;
        router.post('/logout', {}, {
            onSuccess: () => localStorage.clear()
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger button (avatar + chevron) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer ${isOpen ? 'bg-slate-100' : ''}`}
            >
                {profilePic ? (
                    <img 
                        src={profilePic} 
                        alt={userName} 
                        className="w-8 h-8 rounded-full shadow-sm border border-slate-200 object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {userInitial}
                    </div>
                )}
                <ChevronDown 
                    size={14} 
                    className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* User info section */}
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            {profilePic ? (
                                <img 
                                    src={profilePic} 
                                    alt={userName}
                                    className="w-10 h-10 rounded-full shadow-sm border border-slate-200 object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                    {userInitial}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm text-slate-900 truncate" title={userName}>
                                    {userName}
                                </p>
                                <p className="text-[10px] font-mono text-slate-500 mt-0.5 tracking-tight">
                                    UID: {user?.account_number || '—'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Tier badge */}
                        <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${tier.bg}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${tier.dot}`}></div>
                                <span className={`text-[11px] font-bold ${tier.color}`}>
                                    {tier.name} Account
                                </span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${tier.color}`}>
                                {tier.level}
                            </span>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        <Link 
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <UserIcon size={14} className="text-slate-400" />
                            My Profile
                        </Link>
                        <Link 
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <Settings size={14} className="text-slate-400" />
                            Settings
                        </Link>
                        {Number(user?.kyc_tier || 1) < 3 ? (
                            <Link 
                                href="/settings?action=upgrade"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                                <Sparkles size={14} className="text-amber-500" />
                                Upgrade Tier
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-amber-700">
                                <Star size={14} className="text-amber-500 fill-amber-400" />
                                <span>Achiever Member ★</span>
                            </div>
                        )}
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-slate-100 py-1">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <LogOut size={14} />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}