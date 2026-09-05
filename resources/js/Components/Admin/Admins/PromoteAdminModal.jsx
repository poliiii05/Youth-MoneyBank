// resources/js/Components/Admin/Admins/PromoteAdminModal.jsx
import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import { UserPlus, X, Crown, ShieldCheck, Search } from 'lucide-react';
import Avatar from '../Avatar';

export default function PromoteAdminModal({ isOpen, onClose }) {
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [role, setRole] = useState('admin');
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const searchTimerRef = useRef(null);

    // Search debounce
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        
        if (selectedUser) return; // Skip if user already selected
        
        if (searchInput.trim().length < 2) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        searchTimerRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await fetch(`/admin/admins/search-users?q=${encodeURIComponent(searchInput.trim())}`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                    setShowDropdown(true);
                }
            } catch (e) {
                console.error('Search failed:', e);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [searchInput, selectedUser]);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSearchInput(user.email);
        setShowDropdown(false);
    };

    const handleClearSelection = () => {
        setSelectedUser(null);
        setSearchInput('');
        setSearchResults([]);
    };

    if (!isOpen) return null;

    const handleSubmit = () => {
        setError('');
        if (!selectedUser) {
            setError('Please select a user from the search.');
            return;
        }
        if (reason.trim().length < 10) {
            setError('Please provide a detailed reason (min 10 characters).');
            return;
        }

        setIsProcessing(true);
        router.post('/admin/admins/promote', {
            email: selectedUser.email,
            role,
            reason: reason.trim(),
        }, {
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                onClose();
                setSearchInput('');
                setSelectedUser(null);
                setReason('');
                setRole('admin');
            },
            onError: (errors) => setError(Object.values(errors)[0] || 'Failed to promote user.'),
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                            <UserPlus size={20} className="text-primary" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-foreground">Promote to Admin</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">Grant admin privileges</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={isProcessing} className="p-1 hover:bg-muted rounded-lg cursor-pointer disabled:opacity-40">
                        <X size={16} className="text-muted-foreground" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    {/* User search */}
                    <div>
                        <label className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1.5 block">
                            Find User <span className="text-destructive">*</span>
                        </label>
                        
                        {/* Selected user display */}
                        {selectedUser ? (
                            <div className="flex items-center gap-3 p-2.5 bg-primary/10 border border-primary/25 rounded-lg">
                                <Avatar src={selectedUser.profile_picture} name={selectedUser.name} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate">{selectedUser.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium truncate">{selectedUser.email}</p>
                                </div>
                                <span className="text-[9px] font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                                    Tier {selectedUser.kyc_tier}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClearSelection}
                                    disabled={isProcessing}
                                    className="p-1 hover:bg-primary/15 rounded cursor-pointer disabled:opacity-40"
                                >
                                    <X size={12} className="text-muted-foreground" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                    placeholder="Search by name or email..."
                                    disabled={isProcessing}
                                    autoComplete="off"
                                    className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                                
                                {/* Dropdown results */}
                                {showDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border max-h-64 overflow-y-auto z-10">
                                        {isSearching ? (
                                            <div className="p-3 text-center">
                                                <p className="text-[10px] font-medium text-muted-foreground">Searching...</p>
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((u) => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    onClick={() => handleSelectUser(u)}
                                                    className="w-full flex items-center gap-3 p-2.5 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 text-left transition-colors"
                                                >
                                                    <Avatar src={u.profile_picture} name={u.name} size="sm" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-foreground truncate">{u.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium truncate">{u.email}</p>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                                        Tier {u.kyc_tier}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-3 text-center">
                                                <p className="text-[10px] font-medium text-muted-foreground">No users found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1.5 block">
                            Role <span className="text-destructive">*</span>
                        </label>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                disabled={isProcessing}
                                className={`w-full flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-left ${
                                    role === 'admin' ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border hover:border-input'
                                }`}
                            >
                                <ShieldCheck size={16} className="text-primary" strokeWidth={2.5} />
                                <div>
                                    <p className="text-xs font-black text-foreground">Admin</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Day-to-day operations</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('super_admin')}
                                disabled={isProcessing}
                                className={`w-full flex items-center gap-3 p-3 border rounded-lg cursor-pointer text-left ${
                                    role === 'super_admin' ? 'border-amber-400 bg-accent/10 ring-2 ring-amber-100' : 'border-border hover:border-input'
                                }`}
                            >
                                <Crown size={16} className="text-accent" strokeWidth={2.5} />
                                <div>
                                    <p className="text-xs font-black text-foreground">Super Admin</p>
                                    <p className="text-[10px] text-muted-foreground font-medium">Full access + destructive actions</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Reason */}
                        <div>
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1.5 block">
                                Reason <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., New hire for customer support team"
                                rows={3}
                                disabled={isProcessing}
                                maxLength={500}
                                className={`w-full px-3 py-2 text-xs font-medium border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                                    error ? 'border-destructive/40 focus:border-destructive focus:ring-destructive/10' : 'border-border focus:border-primary focus:ring-primary/10'
                                }`}
                            />
                            
                                {/* Character counter + validation */}
                                <div className="flex items-center justify-between mt-1">
                                    {error ? (
                                        <p className="text-[10px] font-bold text-destructive">{error}</p>
                                    ) : (
                                        <p className={`text-[10px] font-bold ${
                                            reason.trim().length >= 10 ? 'text-success' : 'text-destructive'
                                        }`}>
                                            {reason.trim().length >= 10 
                                                ? '✓ Minimum reached' 
                                                : `${10 - reason.trim().length} more characters needed`
                                            }
                                        </p>
                                    )}
                                    <p className="text-[10px] font-medium text-muted-foreground">
                                        {reason.length}/500
                                    </p>
                                </div>
                        </div>
                </div>

                <div className="px-5 py-4 bg-muted border-t border-border flex gap-2 justify-end">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-lg cursor-pointer disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isProcessing || !selectedUser || reason.trim().length < 10}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-lg shadow-md shadow-primary/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        {isProcessing ? 'Promoting...' : 'Promote User'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}