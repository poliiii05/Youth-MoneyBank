// resources/js/Components/Layouts/ProfileDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { ChevronDown, LogOut } from 'lucide-react';
import SignOutModal from '../Modals/SignOutModal';

export default function ProfileDropdown({ user }) {

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [signOutOpen, setSignOutOpen] = useState(false);
   
    
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

    // Reads the same --tier-N tokens as the sidebar and the upgrade ladder, so
    // the three places that show a tier cannot disagree about its colour.
    const getTierDetails = (tier) => {
        const current = Number(tier || 1);
        const names = { 1: 'Starter', 2: 'Builder', 3: 'Achiever' };
        return {
            name: names[current] || 'Starter',
            level: `Tier ${current}`,
            dotStyle: { backgroundColor: `var(--tier-${current})` },
        };
    };

    const tier = getTierDetails(user?.kyc_tier);
    const userName = user?.name || 'User';
    const userInitial = userName.charAt(0).toUpperCase();
    // One flag for both avatars in this component — if the URL is dead in the
    // trigger it is dead in the panel too, and Google's avatar URLs do expire.
    const [avatarFailed, setAvatarFailed] = useState(false);
    const profilePic = !avatarFailed ? user?.profile_picture : null;

    //Logout
        const openSignOutModal = (e) => {
        e.preventDefault();
        setIsOpen(false);
        setSignOutOpen(true);
    };

    const confirmSignOut = () => {
        localStorage.clear();
        
        // Submit logout request in background (fire and forget)
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });
        
        // Navigate immediately — don't wait for response
        window.location.href = '/';
    };// End Logout

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger button (avatar + chevron) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-muted transition-colors cursor-pointer ${isOpen ? 'bg-muted' : ''}`}
            >
                {profilePic ? (
                    <img 
                        src={profilePic} 
                        alt={userName}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarFailed(true)} 
                        className="w-8 h-8 rounded-full shadow-sm border border-border object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {userInitial}
                    </div>
                )}
                <ChevronDown 
                    size={14} 
                    className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-popover rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* User info section */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3 mb-3">
                            {profilePic ? (
                                <img 
                                    src={profilePic} 
                                    alt={userName}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarFailed(true)}
                                    className="w-10 h-10 rounded-full shadow-sm border border-border object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                                    {userInitial}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm text-foreground truncate" title={userName}>
                                    {userName}
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground mt-0.5 tracking-tight">
                                    UID: {user?.account_number || '—'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Tier badge */}
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={tier.dotStyle}></div>
                                <span className="text-[11px] font-bold text-foreground">
                                    {tier.name} Account
                                </span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                {tier.level}
                            </span>
                        </div>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-border py-1">
                        <button 
                            onClick={openSignOutModal}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                            <LogOut size={14} />
                            Sign out
                        </button>
                    </div> 
                </div>
            )}
                    <SignOutModal
                        isOpen={signOutOpen}
                        onClose={() => setSignOutOpen(false)}
                        onConfirm={confirmSignOut}
                        isProcessing={false}
                    />
            </div>
        );
    }