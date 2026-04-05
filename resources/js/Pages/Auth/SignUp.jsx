import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../../Components/Common/Navbar.jsx';
import PrivacyPolicyModal from '../../Pages/Public/PrivacyPolicyModal.jsx';
import TermsAndConditionsModal from '../../Pages/Public/TermsAndConditionsModal.jsx';
import { Wallet, Target, TrendingUp, ChevronDown } from 'lucide-react';

function TurnstileOverlay({ isOpen, onSuccess, onError, onClose, phoneNumber }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const hasRenderedRef = useRef(false);

    useEffect(() => {
        if (!isOpen) return;
        let mounted = true;

        const loadAndRender = () => {
            if (!mounted || !containerRef.current) return;
            if (!window.turnstile) { setTimeout(loadAndRender, 100); return; }
            if (hasRenderedRef.current) return;

            try {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: '0x4AAAAAACCXzxGBQrb5Aa0c',
                    callback: async (token) => {
                        try {
                            const response = await fetch('/verify-turnstile', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                                body: JSON.stringify({ token, phone: phoneNumber }),
                            });
                            const data = await response.json();
                            if (data.success) { if (onSuccess) onSuccess(data); } 
                            else {
                                if (onError) onError(data.message || 'Verification failed');
                                if (window.turnstile && widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current);
                            }
                        } catch (error) {
                            if (onError) onError(error.message);
                            if (window.turnstile && widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current);
                        }
                    },
                    'error-callback': () => { if (onError) onError('Captcha error'); },
                    'expired-callback': () => { if (onError) onError('Captcha expired'); },
                    theme: 'light', size: 'normal',
                });
                hasRenderedRef.current = true;
            } catch (error) {
                if (onError) onError(error.message);
            }
        };

        if (!document.querySelector('script[src*="turnstile"]')) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true; script.defer = true; script.onload = loadAndRender;
            document.head.appendChild(script);
        } else { setTimeout(loadAndRender, 100); }

        return () => {
            mounted = false;
            if (window.turnstile && widgetIdRef.current !== null) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                    hasRenderedRef.current = false; widgetIdRef.current = null;
                } catch (e) { console.error('Cleanup error:', e); }
            }
        };
    }, [isOpen, onSuccess, onError, phoneNumber]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-4">🛡️</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Security Verification</h3>
                        <p className="text-gray-600">Please complete the verification below</p>
                    </div>
                    <div ref={containerRef} className="flex justify-center mb-6"></div>
                    <button onClick={onClose} className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
                </div>
            </div>
        </>
    );
}

export default function SignUp() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userDetails, setUserDetails] = useState({ firstName: '', lastName: '', email: '', birthDate: '' });
    
    // BIRTHDAY PICKER STATES
    const [bMonth, setBMonth] = useState('');
    const [bDay, setBDay] = useState('');
    const [bYear, setBYear] = useState('');

    const [showTurnstile, setShowTurnstile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    // SYNC 3 DROPDOWNS TO 1 DATE STRING
    useEffect(() => {
        if (bMonth && bDay && bYear) {
            const formattedMonth = bMonth.padStart(2, '0');
            const formattedDay = bDay.padStart(2, '0');
            setUserDetails(prev => ({ ...prev, birthDate: `${bYear}-${formattedMonth}-${formattedDay}` }));
        } else {
            setUserDetails(prev => ({ ...prev, birthDate: '' }));
        }
    }, [bMonth, bDay, bYear]);

    // OPTIONS DATA
    const months = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' }
    ];
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

    const handleCaptchaSuccess = (response) => {
        setShowTurnstile(false); setIsLoading(false);
        alert('Verification successful! Account created.');
    };

    const handleCaptchaError = (error) => {
        console.error('Captcha error:', error);
        setShowTurnstile(false); setIsLoading(false);
        alert(`Verification error: ${error}`);
    };

    const handleSignUp = () => {
        if (!isFormValid()) return;
        setIsLoading(true); setShowTurnstile(true);
    };

    const isFormValid = () => {
        return (
            userDetails.firstName && userDetails.lastName && userDetails.birthDate &&
            phoneNumber.length === 10 && acceptedTerms
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <Navbar currentPage="signup" />
            
            <main className="flex-1 flex items-center justify-center px-4 py-6">
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
                    <div className="flex h-full min-h-[520px]">
                        
                        {/* LEFT SIDE */}
                        <div className="hidden lg:flex w-1/2 flex-col justify-center p-8 lg:p-10 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                            <div className="relative z-10">
                                {/* NEW MODERN BADGE INSTEAD OF UNDERLINE/ICON */}
                                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
                                    <span className="text-cyan-300 text-[11px] font-bold uppercase tracking-wider">Start Saving Today</span>
                                </div>
                                
                                <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 tracking-tight"> 
                                    Join Youth<br/>MoneyBank
                                </h1>
                                
                                <p className="text-sm text-blue-100 mb-8 pr-4 leading-relaxed">
                                    Start your financial journey and take control of your future with secure, progressive savings.
                                </p>

                                <div className="space-y-3">
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <Wallet size={20} className="mt-0.5 text-cyan-300 shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm mb-0.5">Smart Savings Goals</h3>
                                                <p className="text-xs text-blue-100">Create custom stashes and watch your money grow.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <Target size={20} className="mt-0.5 text-cyan-300 shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm mb-0.5">Track Allowances & Spending</h3>
                                                <p className="text-xs text-blue-100">Monitor your daily expenses and incoming allowances.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp size={20} className="mt-0.5 text-cyan-300 shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm mb-0.5">Progressive Account Tiers</h3>
                                                <p className="text-xs text-blue-100">Start with just your phone number and upgrade as you grow.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/20">
                                    <p className="text-sm font-semibold">Built with Bank-Level Security</p>
                                    <p className="text-xs text-blue-200 mt-0.5">Simulated Platform. Safe. Secure.</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE - FORM */}
                        <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center bg-white">
                            <div className="max-w-[400px] mx-auto w-full">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
                                    <p className="text-sm text-gray-600">Get started in just a few steps</p>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                            <span className="text-base">🇵🇭</span><span className="text-gray-700 font-medium text-sm">+63</span>
                                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                        </div>
                                        <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9XX XXX XXXX" className="w-full pl-24 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={userDetails.firstName} onChange={(e) => setUserDetails({...userDetails, firstName: e.target.value})} placeholder="Juan" className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={userDetails.lastName} onChange={(e) => setUserDetails({...userDetails, lastName: e.target.value})} placeholder="Dela Cruz" className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email (Optional)</label>
                                    <input type="email" value={userDetails.email} onChange={(e) => setUserDetails({...userDetails, email: e.target.value})} placeholder="your@email.com" className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>

                                {/* CUSTOM 3-DROPDOWN DATE OF BIRTH */}
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="relative">
                                            <select value={bMonth} onChange={(e) => setBMonth(e.target.value)} className={`w-full pl-3 pr-8 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-white ${!bMonth ? 'text-gray-400' : 'text-gray-900'}`}>
                                                <option value="" disabled className="text-gray-400">Month</option>
                                                {months.map(m => <option key={m.value} value={m.value} className="text-gray-900">{m.label}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        </div>
                                        
                                        <div className="relative">
                                            <select value={bDay} onChange={(e) => setBDay(e.target.value)} className={`w-full pl-3 pr-8 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-white ${!bDay ? 'text-gray-400' : 'text-gray-900'}`}>
                                                <option value="" disabled className="text-gray-400">Day</option>
                                                {days.map(d => <option key={d} value={d} className="text-gray-900">{d}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        </div>

                                        <div className="relative">
                                            <select value={bYear} onChange={(e) => setBYear(e.target.value)} className={`w-full pl-3 pr-8 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-white ${!bYear ? 'text-gray-400' : 'text-gray-900'}`}>
                                                <option value="" disabled className="text-gray-400">Year</option>
                                                {years.map(y => <option key={y} value={y} className="text-gray-900">{y}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* TERMS CHECKBOX */}
                                <div className="flex items-start gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-200 mb-5">
                                    <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                    <label htmlFor="terms" className="text-xs text-gray-700 leading-tight cursor-pointer select-none">
                                        I agree to the <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-blue-600 hover:underline font-bold">Terms & Conditions</button> and <button onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-blue-600 hover:underline font-bold">Privacy Policy</button>
                                    </label>
                                </div>

                                <button onClick={handleSignUp} disabled={!isFormValid() || isLoading} className="w-full py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md mb-4 active:scale-95">
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>

                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                    <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400 font-medium">Or sign up with</span></div>
                                </div>

                                <button onClick={() => alert('Google Sign-Up integration coming soon!')} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 cursor-pointer active:scale-95">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    <span className="font-semibold text-gray-700">Sign up with Google</span>
                                </button>

                                <div className="text-center text-xs text-gray-500">
                                    Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Login here</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <TurnstileOverlay isOpen={showTurnstile} onClose={() => setShowTurnstile(false)} onSuccess={handleCaptchaSuccess} onError={handleCaptchaError} phoneNumber={phoneNumber} />

            {typeof document !== 'undefined' && createPortal(
                <>
                    <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
                    <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
                </>, document.body
            )}
        </div>
    );
}