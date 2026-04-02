import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../../Components/Common/Navbar.jsx';
import PrivacyPolicyModal from '../Public/PrivacyPolicyModal.jsx';
import TermsAndConditionsModal from '../Public/TermsAndConditionsModal.jsx';

export default function Login() {
    // Form States
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoadingLogin, setIsLoadingLogin] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    
    // Modal States
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    // ==========================================
    // TYPING ANIMATION STATE (WITH TRACKER LINE)
    // ==========================================
    const [welcomeText, setWelcomeText] = useState('');
    const [typingProgress, setTypingProgress] = useState(0); // Bagong state para sa tracker
    
    useEffect(() => {
        const fullTextArray = [..."Welcome Back! 👋"]; 
        let currentIndex = 0;
        let isTyping = true;
        let timerId;

        const loopAnimation = () => {
            if (isTyping) {
                if (currentIndex <= fullTextArray.length) {
                    // Update text and progress
                    setWelcomeText(fullTextArray.slice(0, currentIndex).join(''));
                    setTypingProgress((currentIndex / fullTextArray.length) * 100); // Compute percentage
                    
                    currentIndex++;
                    timerId = setTimeout(loopAnimation, 100);
                } else {
                    // Maghihintay ng 5 seconds bago umulit
                    isTyping = false;
                    timerId = setTimeout(loopAnimation, 5000); 
                }
            } else {
                // Reset states bago mag-type ulit
                setWelcomeText('');
                setTypingProgress(0);
                currentIndex = 0;
                isTyping = true;
                timerId = setTimeout(loopAnimation, 200);
            }
        };

        timerId = setTimeout(loopAnimation, 100);
        return () => clearTimeout(timerId);
    }, []);

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleGetCode = () => {
        if (phoneNumber.length !== 10) {
            alert('Please enter a valid phone number');
            return;
        }
        alert('Test Mode: OTP Sent! (You can type any 6 digits for now)');
        setOtpSent(true);
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
            <Navbar currentPage="login" />
            
            <main className="flex-1 flex items-center justify-center px-4 py-6">
                {/* BALIK SA ORIGINAL SIZE: max-w-5xl at inalis ang min-h na masyadong malaki */}
                <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
                    <div className="flex h-full min-h-[550px]">
                        
                        {/* ========================================== */}
                        {/* LEFT SIDE - BLUE/CYAN & NEW COPY           */}
                        {/* ========================================== */}
                        <div className="hidden lg:flex w-1/2 flex-col justify-center p-10 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white relative overflow-hidden">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                            <div className="relative z-10">
                                {/* TYPING ANIMATION CONTAINER */}
                                <div className="h-[48px] mb-1 flex items-end"> 
                                    <h1 className="text-4xl font-bold leading-none">
                                        {welcomeText}
                                        <span className="animate-pulse ml-1 border-r-4 border-white/70 h-8 inline-block align-bottom"></span>
                                    </h1>
                                </div>
                                
                                {/* PROGRESS BAR / BATTERY TRACKER LINE */}
                                <div className="w-56 bg-white/10 rounded-full h-1.5 mb-8 overflow-hidden">
                                    <div 
                                        className="bg-white h-full rounded-full transition-all duration-100 ease-out"
                                        style={{ width: `${typingProgress}%` }}
                                    ></div>
                                </div>
                                
                                <p className="text-lg text-blue-100 mb-8 leading-relaxed pr-6">
                                    Access your Youth Money Bank dashboard to manage your finances, track your goals, and secure your future.
                                </p>

                                <div className="space-y-3">
                                    {/* Feature 1 */}
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl mt-0.5">🎯</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Hit Your Savings Goals</h3>
                                                <p className="text-sm text-blue-100">Create stashes and monitor your progress in real-time.</p>
                                            </div>
                                        </div>
                                    </div>

                                        {/* Feature 2 */}
                                        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl mt-0.5">🔒</div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold mb-1">Bank-Level Security</h3>
                                                    <p className="text-sm text-blue-100">Your money and personal data are strictly protected.</p>
                                                </div>
                                            </div>
                                        </div>

                                           {/* Feature 3 */}
                                            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                                                <div className="flex items-start gap-3">
                                                    <div className="text-2xl mt-0.5">📈</div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold mb-1">Progressive Account Tiers</h3>
                                                        <p className="text-sm text-blue-100">Start saving instantly with basic details, and unlock more features as you verify.</p>
                                                    </div>
                                                </div>
                                            </div>
                                </div>
                            </div>
                        </div>

                        {/* ========================================== */}
                        {/* RIGHT SIDE - RESTORED ORIGINAL SIZES       */}
                        {/* ========================================== */}
                        <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center bg-white">
                            <div className="max-w-md mx-auto w-full">
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Login to Account</h2>
                                    <p className="text-sm text-gray-600">Enter your credentials to continue</p>
                                </div>

                                {/* Phone Input - Balik sa py-2.5 */}
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                            <span className="text-base">🇵🇭</span>
                                            <span className="text-gray-700 font-medium text-sm">+63</span>
                                            <div className="w-px h-5 bg-gray-300 mx-1"></div>
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

                                {/* OTP Input - Balik sa py-2.5 */}
                                <div className="mb-5">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        OTP Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="6-digit code"
                                            className="flex-1 px-3 py-2.5 text-center text-sm tracking-widest font-semibold border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            onClick={handleGetCode}
                                            disabled={phoneNumber.length !== 10 || otpSent}
                                            className="px-4 py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap active:scale-95"
                                        >
                                            {otpSent ? 'Sent ✓' : 'Get Code'}
                                        </button>
                                    </div>
                                </div>

                                {/* Login Button - py-2.5 */}
                                <button
                                    onClick={handleLogin}
                                    disabled={phoneNumber.length !== 10 || otp.length !== 6 || isLoadingLogin}
                                    className="w-full py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md mb-4 active:scale-95"
                                >
                                    {isLoadingLogin ? 'Logging in...' : 'Login via OTP'}
                                </button>

                                {/* Divider */}
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
                                    </div>
                                </div>

                                {/* Google Sign In - py-2.5 */}
                                <a
                                    href="/auth/google"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 cursor-pointer active:scale-95 group"
                                >
                                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
                                    <a href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                        Sign up now
                                    </a>
                                </div>

                                {/* Terms with Modal Links */}
                                <div className="border-t border-gray-100 pt-3">
                                    <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                                        By logging in, you agree to our{' '}
                                        <button onClick={() => setShowTerms(true)} className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer">
                                            Terms & Conditions
                                        </button>
                                        {' '}and{' '}
                                        <button onClick={() => setShowPrivacy(true)} className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer">
                                            Privacy Policy
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
                    <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
                </>,
                document.body
            )}
        </div>
    );
}