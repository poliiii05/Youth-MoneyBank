    import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PrivacyPolicyModal from '../../Pages/Public/PrivacyPolicyModal.jsx';
import TermsAndConditionsModal from '../../Pages/Public/TermsAndConditionsModal.jsx';


// Turnstile Overlay Component
function TurnstileOverlay({ isOpen, onSuccess, onError, onClose, phoneNumber }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const hasRenderedRef = useRef(false);

    useEffect(() => {
        if (!isOpen) return;

        let mounted = true;

        const loadAndRender = () => {
            if (!mounted || !containerRef.current) return;
            
            if (!window.turnstile) {
                setTimeout(loadAndRender, 100);
                return;
            }

            if (hasRenderedRef.current) return;

            try {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: '0x4AAAAAACCXzxGBQrb5Aa0c',
                    callback: async (token) => {
                        try {
                            const response = await fetch('/verify-turnstile', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                },
                                body: JSON.stringify({ 
                                    token,
                                    phone: phoneNumber 
                                }),
                            });

                            const data = await response.json();

                            if (data.success) {
                                if (onSuccess) onSuccess(data);
                            } else {
                                if (onError) onError(data.message || 'Verification failed');
                                if (window.turnstile && widgetIdRef.current !== null) {
                                    window.turnstile.reset(widgetIdRef.current);
                                }
                            }
                        } catch (error) {
                            if (onError) onError(error.message);
                            if (window.turnstile && widgetIdRef.current !== null) {
                                window.turnstile.reset(widgetIdRef.current);
                            }
                        }
                    },
                    'error-callback': () => {
                        if (onError) onError('Captcha error');
                    },
                    'expired-callback': () => {
                        if (onError) onError('Captcha expired');
                    },
                    theme: 'light',
                    size: 'normal',
                });

                hasRenderedRef.current = true;
            } catch (error) {
                if (onError) onError(error.message);
            }
        };

        if (!document.querySelector('script[src*="turnstile"]')) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.onload = loadAndRender;
            document.head.appendChild(script);
        } else {
            setTimeout(loadAndRender, 100);
        }

        return () => {
            mounted = false;
            if (window.turnstile && widgetIdRef.current !== null) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                    hasRenderedRef.current = false;
                    widgetIdRef.current = null;
                } catch (e) {
                    console.error('Cleanup error:', e);
                }
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

                    <button
                        onClick={onClose}
                        className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
}

// Navbar Component with active page detection
function Navbar({ currentPage = 'signup' }) {
    const navLinks = [
        { name: 'Home', href: '/', key: 'home' },
        { name: 'About', href: '/about', key: 'about' },
        { name: 'FAQs', href: '/faq', key: 'faq' },
    ];

    const isActive = (key) => currentPage === key;

    return (
        <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-md border-b border-blue-100 sticky top-0 z-50">
            {/* LEFT SIDE — LOGO */}
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
                <img 
                    src="/images/YMB_HeaderLogo.png"
                    alt="Logo Icon"
                    className="h-12 w-auto object-contain"
                />
                <img 
                    src="/images/YMB_HeaderText.png"
                    alt="YouthMoneyBank Text Logo"
                    className="h-8 w-auto object-contain"
                />
            </a>

            {/* RIGHT SIDE — NAVIGATION */}
            <div className="flex items-center gap-8">
                {/* NAV LINKS */}
                <div className="flex items-center gap-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.key}
                            href={link.href}
                            className={`relative px-4 py-2 font-semibold transition-all duration-300 group ${
                                isActive(link.key)
                                    ? 'text-blue-700'
                                    : 'text-gray-700 hover:text-blue-600'
                            }`}
                        >
                            {link.name}
                            {/* Animated underline */}
                            <span
                                className={`absolute bottom-0 left-0 h-1 bg-blue-700 rounded-full transition-all duration-300 ${
                                    isActive(link.key) ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}
                            />
                        </a>
                    ))}
                </div>

                {/* LOGIN BUTTON */}
                <a href="/login" className="cursor-pointer">
                    <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg">
                        Login
                    </button>
                </a>
            </div>
        </nav>
    );
}



export default function SignUp() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: ''
    });
    const [showTurnstile, setShowTurnstile] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const handleCaptchaSuccess = (response) => {
        setShowTurnstile(false);
        setCaptchaVerified(true);
        setIsLoading(false);
        alert('Verification successful! Account created.');
    };

    const handleCaptchaError = (error) => {
        console.error('Captcha error:', error);
        setShowTurnstile(false);
        setIsLoading(false);
        alert(`Verification error: ${error}`);
    };

    const handleSignUp = () => {
        // Validate required fields
        if (!userDetails.firstName || !userDetails.lastName || !userDetails.birthDate || phoneNumber.length !== 10) {
            alert('Please fill in all required fields');
            return;
        }

        if (!acceptedTerms) {
            alert('Please accept the Terms & Conditions');
            return;
        }
        
        // Start loading and show Turnstile overlay for verification
        setIsLoading(true);
        setShowTurnstile(true);
    };

    const handleGoogleSignUp = () => {
        alert('Google Sign-Up integration coming soon!');
    };

    const isFormValid = () => {
        return (
            userDetails.firstName &&
            userDetails.lastName &&
            userDetails.birthDate &&
            phoneNumber.length === 10 &&
            acceptedTerms
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <Navbar currentPage="signup" />
            
            <main className="flex-1 flex items-center justify-center px-4 py-6">
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
                    <div className="flex h-full">
                        
                        {/* LEFT SIDE - Welcome Message */}
                        <div className="hidden lg:flex w-1/2 flex-col justify-center p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
                            <div>
                                <div className="text-6xl mb-3">🚀</div>
                                <h1 className="text-4xl font-bold mb-2">Join Youth Money Bank</h1>
                                <div className="h-1 w-20 bg-white/50 rounded-full mb-4"></div>
                                <p className="text-lg text-blue-100 mb-8">
                                    Start your financial journey and take control of your future
                                </p>

                                <div className="space-y-3">
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">💰</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Smart Savings</h3>
                                                <p className="text-sm text-blue-100">Build your wealth with intelligent tools</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">📊</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Track Your Progress</h3>
                                                <p className="text-sm text-blue-100">Monitor spending and savings goals</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">🎓</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Learn & Grow</h3>
                                                <p className="text-sm text-blue-100">Financial education for young adults</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/20">
                                    <p className="text-sm font-semibold">Trusted by 10,000+ students</p>
                                    <p className="text-xs text-blue-200">Join the community today</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE - Sign Up Form */}
                        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center">
                            <div className="max-w-md mx-auto w-full">
                                <div className="text-center mb-4">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Create Account</h2>
                                    <p className="text-sm text-gray-600">Get started in just a few steps</p>
                                </div>

                                {/* Phone Number */}
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                            <span className="text-base">🇵🇭</span>
                                            <span className="text-gray-700 font-medium text-sm">+63</span>
                                            <div className="w-px h-5 bg-gray-300"></div>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="9XX XXX XXXX"
                                            className="w-full pl-24 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">First Name</label>
                                        <input
                                            type="text"
                                            value={userDetails.firstName}
                                            onChange={(e) => setUserDetails({...userDetails, firstName: e.target.value})}
                                            className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last Name</label>
                                        <input
                                            type="text"
                                            value={userDetails.lastName}
                                            onChange={(e) => setUserDetails({...userDetails, lastName: e.target.value})}
                                            className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={userDetails.email}
                                        onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                                        placeholder="your@email.com"
                                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Birth Date */}
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 ">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={userDetails.birthDate}
                                        onChange={(e) => setUserDetails({...userDetails, birthDate: e.target.value})}
                                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                    />
                                </div>

                                {/* Terms & Conditions */}
                                <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed cursor-pointer">
                                        I agree to the{' '}
                                        <button
                                            onClick={() => setShowTerms(true)}
                                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                                        >
                                            Terms & Conditions
                                        </button>
                                        {' '}and{' '}
                                        <button
                                            onClick={() => setShowPrivacy(true)}
                                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                                        >
                                            Privacy Policy
                                        </button>
                                    </label>
                                </div>

                                {/* Create Account Button */}
                                <button
                                    onClick={handleSignUp}
                                    disabled={!isFormValid() || isLoading}
                                    className="w-full py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md mb-3"
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>

                                {/* Divider */}
                                <div className="relative my-3">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2 bg-white text-gray-500 font-medium">Or sign up with</span>
                                    </div>
                                </div>

                                {/* Google Sign Up */}
                                <button
                                    onClick={handleGoogleSignUp}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all mb-3 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span className="font-semibold text-gray-700 cursor-pointer">Sign up with Google</span>
                                </button>

                                {/* Login Link */}
                                <div className="text-center text-xs text-gray-600">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                                        Login here
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Turnstile Overlay */}
            <TurnstileOverlay 
                isOpen={showTurnstile}
                onClose={() => setShowTurnstile(false)}
                onSuccess={handleCaptchaSuccess}
                onError={handleCaptchaError}
                phoneNumber={phoneNumber}
            />

            {/* Modals */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    <PrivacyPolicyModal 
                        isOpen={showPrivacy} 
                        onClose={() => setShowPrivacy(false)} 
                    />

                    <TermsAndConditionsModal 
                        isOpen={showTerms} 
                        onClose={() => setShowTerms(false)} 
                    />
                </>,
                document.body
            )}
        </div>
    );
}