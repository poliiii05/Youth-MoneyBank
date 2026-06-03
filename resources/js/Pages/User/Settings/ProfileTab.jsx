// resources/js/Pages/User/Settings/ProfileTab.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Lock, Check, AlertCircle, Loader2, Phone } from 'lucide-react';

export default function ProfileTab({ profile }) {
    const [name, setName] = useState(profile.name || '');
    const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // Check if form has changes
    const hasChanges = 
        name !== (profile.name || '') || 
        phoneNumber !== (profile.phone_number || '');

    // Hide success message after 3 seconds
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => setIsSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleDiscard = () => {
        setName(profile.name || '');
        setPhoneNumber(profile.phone_number || '');
        setErrors({});
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!hasChanges || isProcessing) return;

        setIsProcessing(true);
        setErrors({});

        router.patch('/settings/profile', {
            name: name.trim(),
            phone_number: phoneNumber.trim() || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
                setIsSuccess(true);
            },
            onError: (errs) => {
                setIsProcessing(false);
                setErrors(errs);
            }
        });
    };

    // Generate avatar with initial fallback
    const userInitial = (profile.name || 'U').charAt(0).toUpperCase();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* SUCCESS BANNER */}
            {isSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Check size={16} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                    <p className="text-xs font-semibold text-emerald-700">Profile updated successfully!</p>
                </div>
            )}

            {/* PERSONAL INFORMATION SECTION */}
            <div>
                    <div className="mb-4">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Personal Information</h3>
                        </div>

                {/* AVATAR DISPLAY */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
                    {profile.profile_picture ? (
                        <img 
                            src={profile.profile_picture} 
                            alt={profile.name}
                            className="w-16 h-16 rounded-full shadow-sm border-2 border-white object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                            {userInitial}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{profile.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {profile.profile_picture ? 'Synced from Google' : 'Default avatar'}
                        </p>
                    </div>
                </div>

                {/* FORM FIELDS */}
                <div className="space-y-4">

                    {/* Full Name */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            maxLength={100}
                            className={`w-full px-3 py-2.5 border rounded-xl text-sm font-medium outline-none transition-all ${
                                errors.name 
                                    ? 'bg-red-50/20 border-red-400 focus:ring-4 focus:ring-red-50 text-red-900' 
                                    : 'bg-white border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-900'
                            }`}
                        />
                        {errors.name && (
                            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                            Phone Number
                            {profile.phone_verified && (
                                <span className="ml-2 text-[9px] text-emerald-600 font-bold uppercase">Verified ✓</span>
                            )}
                        </label>
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+63 9XX XXX XXXX"
                                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-medium outline-none transition-all ${
                                    errors.phone_number 
                                        ? 'bg-red-50/20 border-red-400 focus:ring-4 focus:ring-red-50 text-red-900' 
                                        : 'bg-white border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-slate-900'
                                }`}
                            />
                        </div>
                        {errors.phone_number && (
                            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.phone_number}
                            </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                            Format: +639XXXXXXXXX or 09XXXXXXXXX
                        </p>
                    </div>
                </div>
            </div>

            {/* ACCOUNT INFORMATION SECTION (read-only) */}
            <div className="pt-6 border-t border-slate-200">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Account Information</h3>
                        </div>

                <div className="space-y-3">
                    {/* Email (read-only) */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Email Address</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{profile.email}</p>
                            {profile.email_verified && (
                                <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">Verified ✓</p>
                            )}
                        </div>
                        <Lock size={14} className="text-slate-400 shrink-0 ml-3" />
                    </div>

                    {/* Account Number (read-only) */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Account Number</p>
                            <p className="text-sm font-mono font-bold text-slate-900 tracking-tight">{profile.account_number}</p>
                        </div>
                        <Lock size={14} className="text-slate-400 shrink-0 ml-3" />
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Member Since</p>
                            <p className="text-sm font-bold text-slate-900">{profile.member_since}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
                <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={!hasChanges || isProcessing}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                        hasChanges && !isProcessing
                            ? 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer'
                            : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    Discard Changes
                </button>
                <button
                    type="submit"
                    disabled={!hasChanges || isProcessing}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 min-w-[140px] ${
                        hasChanges && !isProcessing
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 size={14} className="animate-spin" /> Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>
        </form>
    );
}