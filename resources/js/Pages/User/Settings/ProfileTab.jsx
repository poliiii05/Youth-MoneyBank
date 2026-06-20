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
    
    const validatePhone = (phone) => {
        if (!phone || phone.length === 0) return { error: null, helper: 'Optional · Format: 09XX or +63 9XX' };
        
        if (phone.startsWith('09')) {
            if (phone.length < 11) return { error: null, helper: `${11 - phone.length} digit${11 - phone.length === 1 ? '' : 's'} remaining (need 11 total)`, warning: true };
            if (phone.length === 11) return { error: null, helper: '✓ Valid Philippine mobile format' };
            return { error: 'Too long — 09 format must be exactly 11 digits', helper: '' };
        }
        
        if (phone.startsWith('+63')) {
            if (phone.length < 13) return { error: null, helper: `${13 - phone.length} digit${13 - phone.length === 1 ? '' : 's'} remaining (need 13 total)`, warning: true };
            if (phone.length === 13) return { error: null, helper: '✓ Valid Philippine mobile format' };
            return { error: 'Too long — +63 format must be exactly 13 characters', helper: '' };
        }
        
        return { error: 'Must start with 09 or +63', helper: '' };
    };

    const phoneValidation = validatePhone(phoneNumber);
    const phoneError = errors.phone_number || phoneValidation.error;
    const phoneHelperText = phoneError ? '' : phoneValidation.helper;
    const phoneCounterColor = phoneValidation.warning 
        ? 'text-amber-600' 
        : phoneValidation.helper?.startsWith('✓') 
            ? 'text-emerald-600' 
            : 'text-slate-400';
            
    const hasChanges = 
        name !== (profile.name || '') || 
        phoneNumber !== (profile.phone_number || '');

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

    const userInitial = (profile.name || 'U').charAt(0).toUpperCase();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* SUCCESS BANNER */}
            {isSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Check size={16} className="text-emerald-700" strokeWidth={2.5} />
                    <p className="text-xs font-semibold text-emerald-700">Profile updated successfully!</p>
                </div>
            )}

            {/* PERSONAL INFORMATION SECTION */}
            <div>
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">Personal Information</h3>
                </div>

                {/* AVATAR DISPLAY — emerald themed */}
                <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 rounded-2xl border border-slate-200 mb-6">
                    <div className="relative shrink-0">
                        {profile.profile_picture ? (
                            <img 
                                src={profile.profile_picture} 
                                alt={profile.name}
                                className="w-16 h-16 rounded-full shadow-md border-2 border-white object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-xl shadow-md">
                                {userInitial}
                            </div>
                        )}
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 blur-sm -z-10"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-base font-black text-slate-900 truncate tracking-tight">{profile.name}</p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">{profile.email}</p>
                        <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-widest">
                            {profile.profile_picture ? '✓ Synced from Google' : 'Default avatar'}
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
                                    : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-slate-900'
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
                                <span className="ml-2 text-[9px] text-emerald-700 font-bold uppercase">Verified ✓</span>
                            )}
                        </label>
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    value = value.replace(/[^\d+]/g, '');
                                    if (value.startsWith('+')) {
                                        value = '+' + value.slice(1).replace(/\+/g, '');
                                    }
                                    const maxLength = value.startsWith('+63') ? 13 : 11;
                                    if (value.length > maxLength) {
                                        value = value.slice(0, maxLength);
                                    }
                                    setPhoneNumber(value);
                                }}
                                placeholder="09XX XXX XXXX or +639XX..."
                                maxLength={13}
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-medium outline-none transition-all ${
                                    phoneError 
                                        ? 'bg-red-50/30 border-red-400 focus:ring-4 focus:ring-red-50 text-red-900' 
                                        : 'bg-white border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-slate-900'
                                }`}
                            />
                        </div>
                        {phoneError ? (
                            <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {phoneError}
                            </p>
                        ) : (
                            <p className={`text-[10px] mt-1 font-medium ${phoneCounterColor}`}>
                                {phoneHelperText}
                            </p>
                        )}
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
                                <p className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">Verified ✓</p>
                            )}
                        </div>
                        <Lock size={14} className="text-slate-400 shrink-0 ml-3" />
                    </div>

                    {/* Account Number (read-only) */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Account Number</p>
                            <p className="text-sm font-mono font-bold text-slate-900 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {profile.account_number}
                            </p>
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
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all border active:scale-95 ${
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
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 min-w-[140px] active:scale-[0.98] ${
                        hasChanges && !isProcessing
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-200 cursor-pointer'
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