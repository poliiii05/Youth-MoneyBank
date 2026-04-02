import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../../Components/Common/Navbar.jsx'; // <-- I-adjust mo lang itong path kung nasaan ang Navbar mo
import PrivacyPolicyModal from '../../Pages/Public/PrivacyPolicyModal.jsx';
import TermsAndConditionsModal from '../../Pages/Public/TermsAndConditionsModal.jsx';

// ==========================================
// Turnstile Overlay Component
// ==========================================
// PINA-IKSI KO LANG DITO SA TEXT PARA MADALI MABASA, 
// PERO ILAGAY MO PA RIN YUNG BUONG TURNSTILE CODE MO DITO!
function TurnstileOverlay({ isOpen, onSuccess, onError, onClose, phoneNumber }) {
    // ... (Keep your existing Turnstile logic here)
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
                    {/* Turnstile Container */}
                    <div className="flex justify-center mb-6">...</div>
                    <button onClick={onClose} className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
}

// ==========================================
// Main Login Component
// ==========================================
export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showTurnstile, setShowTurnstile] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successStatus, setSuccessStatus] = useState('');
    const [isLoadingLogin, setIsLoadingLogin] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const handleGetCode = () => {
        if (phoneNumber.length !== 10) {
            alert('Please enter a valid phone number');
            return;
        }
        setShowTurnstile(true);
    };

    const handleCaptchaSuccess = (response) => {
        setShowTurnstile(false);
        setSuccessStatus(response.sms_status || 'SMS code sent successfully');
        setShowSuccessMessage(true);
        setOtpSent(true);
    };

    const handleCaptchaError = (error) => {
        console.error('Captcha error:', error);
        alert(`Verification error: ${error}`);
    };

    const handleLogin = () => {
        if (!otp || otp.length !== 6) {
            alert('Please enter the 6-digit OTP code');
            return;
        }
        
        setIsLoadingLogin(true);
        setTimeout(() => {
            setIsLoadingLogin(false);
            alert('Login successful!');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* TOTOONG NAVBAR COMPONENT NA YUNG GAMIT NATIN */}
            <Navbar currentPage="login" />
            
            <main className="flex-1 flex items-center justify-center px-4 py-6">
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
                    <div className="flex h-full">
                        
                        {/* LEFT SIDE - Welcome Back Message */}
                        <div className="hidden lg:flex w-1/2 flex-col justify-center p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
                            <div>
                                <div className="text-6xl mb-3">👋</div>
                                <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
                                <div className="h-1 w-20 bg-white/50 rounded-full mb-4"></div>
                                <p className="text-lg text-blue-100 mb-8">
                                    Access your dashboard to manage your finances, track goals, and secure your future.
                                </p>

                                <div className="space-y-3">
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">📈</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Track Your Wealth</h3>
                                                <p className="text-sm text-blue-100">Monitor your savings progress in real-time.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">🔒</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Secure & Private</h3>
                                                <p className="text-sm text-blue-100">Your data is protected with bank-level security.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">💸</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Quick Transactions</h3>
                                                <p className="text-sm text-blue-100">Send money or pay bills with just a few clicks.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/20">
                                    <p className="text-sm font-semibold">Your financial journey continues here.</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE - Login Form */}
                        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center">
                            <div className="max-w-md mx-auto w-full">
                                <div className="text-center mb-4">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Login to Account</h2>
                                    <p className="text-sm text-gray-600">Enter your credentials to continue</p>
                                </div>

                                {/* Phone Input */}
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

                                {/* OTP Input */}
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        OTP Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="6-digit code"
                                            className="flex-1 px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={handleGetCode}
                                            disabled={phoneNumber.length !== 10 || otpSent}
                                            className="px-4 py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                        >
                                            {otpSent ? 'Sent ✓' : 'Get Code'}
                                        </button>
                                    </div>
                                </div>

                                {/* Login Button */}
                                <button
                                    onClick={handleLogin}
                                    disabled={phoneNumber.length !== 10 || otp.length !== 6 || isLoadingLogin}
                                    className="w-full py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md mb-3"
                                >
                                    {isLoadingLogin ? 'Logging in...' : 'Login via OTP'}
                                </button>

                                {/* Divider */}
                                <div className="relative my-3">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span>
                                    </div>
                                </div>

                                {/* Google Sign In - FAST REDIRECT MODE */}
                                <a
                                    href="/auth/google"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all mb-3 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    <span className="font-semibold text-gray-700">Sign in with Google</span>
                                </a>

                                {/* Sign Up Link */}
                                <div className="text-center text-xs text-gray-600 mb-3">
                                    Don't have an account?{' '}
                                    <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                                        Sign up now
                                    </a>
                                </div>

                                {/* Terms with Modal Links */}
                                <div className="border-t border-gray-200 pt-2">
                                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                                        By logging in, you agree to our{' '}
                                        <button
                                            onClick={() => setShowTerms(true)}
                                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                        >
                                            Terms & Conditions
                                        </button>
                                        {' '}and{' '}
                                        <button
                                            onClick={() => setShowPrivacy(true)}
                                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                        >
                                            Privacy Policy
                                        </button>
                                    </p>
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