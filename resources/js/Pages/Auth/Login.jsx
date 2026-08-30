import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../../Components/Common/Navbar.jsx';
import PrivacyPolicyModal from '../Public/PrivacyPolicyModal.jsx';
import TermsAndConditionsModal from '../Public/TermsAndConditionsModal.jsx';
import { Target, ShieldCheck, TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card } from '@/Components/ui/card';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoadingLogin, setIsLoadingLogin] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [welcomeText, setWelcomeText] = useState('');

    const emailValid = EMAIL_REGEX.test(email);
    const canSubmit = emailValid && password.length > 0;

    useEffect(() => {
        const fullTextArray = [..."Welcome Back!👋"];
        let currentIndex = 0;
        let isTyping = true;
        let timerId;

        const loopAnimation = () => {
            if (isTyping) {
                if (currentIndex <= fullTextArray.length) {
                    setWelcomeText(fullTextArray.slice(0, currentIndex).join(''));
                    currentIndex++;
                    timerId = setTimeout(loopAnimation, 100);
                } else {
                    isTyping = false;
                    timerId = setTimeout(loopAnimation, 5000);
                }
            } else {
                setWelcomeText('');
                currentIndex = 0;
                isTyping = true;
                timerId = setTimeout(loopAnimation, 200);
            }
        };

        timerId = setTimeout(loopAnimation, 100);
        return () => clearTimeout(timerId);
    }, []);

    const handleLogin = () => {
        if (!canSubmit) return;
        setIsLoadingLogin(true);
        // TODO: wire to POST /login -> Auth::attempt(['email' => ..., 'password' => ...])
        setTimeout(() => {
            setIsLoadingLogin(false);
            alert('Login successful!');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-secondary">
            <Navbar currentPage="login" />

            <main className="flex-1 flex items-center justify-center px-4 py-6">
                <Card className="w-full max-w-5xl rounded-3xl shadow-2xl border-border overflow-hidden p-0">
                    <div className="flex h-full min-h-[550px]">

                        {/* LEFT SIDE */}
                        <div className="hidden lg:flex w-1/2 flex-col justify-center p-10 bg-gradient-to-br from-primary via-primary to-emerald-500 text-primary-foreground relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                            <div className="relative z-10">
                                <div className="h-[48px] mb-6 flex items-end">
                                    <h1 className="text-4xl font-bold leading-none flex items-center">
                                        {welcomeText}
                                        <span className="animate-pulse ml-1 border-r-4 border-white/70 h-8 inline-block"></span>
                                    </h1>
                                </div>
                                <p className="text-lg text-white/90 mb-8 leading-relaxed pr-6">
                                    Access your Youth MoneyBank dashboard to manage your finances, track your goals, and secure your future.
                                </p>

                                <div className="space-y-4">
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <Target size={24} className="mt-0.5 text-accent" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Hit Your Savings Goals</h3>
                                                <p className="text-sm text-white/85">Create stashes and monitor your progress in real-time.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck size={24} className="mt-0.5 text-accent" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Bank-Level Security</h3>
                                                <p className="text-sm text-white/85">Your money and personal data are strictly protected.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp size={24} className="mt-0.5 text-accent" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">Progressive Account Tiers</h3>
                                                <p className="text-sm text-white/85">Start saving instantly with basic details, and unlock more features as you verify.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE - FORM */}
                        <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center bg-card">
                            <div className="max-w-md mx-auto w-full">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-foreground mb-2">Login to Account</h2>
                                    <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
                                </div>

                                {/* EMAIL */}
                                <div className="mb-4">
                                    <Label htmlFor="login-email" className="mb-2 block">Email Address</Label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="login-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            className="pl-10 py-3"
                                        />
                                    </div>
                                </div>

                                {/* PASSWORD */}
                                <div className="mb-2">
                                    <Label htmlFor="login-password" className="mb-2 block">Password</Label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="pl-10 pr-10 py-3"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* FORGOT PASSWORD */}
                                <div className="text-right mb-6">
                                    <a href="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium hover:underline">
                                        Forgot password?
                                    </a>
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleLogin}
                                    disabled={!canSubmit || isLoadingLogin}
                                    size="lg"
                                    className="w-full mb-6"
                                >
                                    {isLoadingLogin ? 'Logging in...' : 'Login'}
                                </Button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-4 bg-card text-muted-foreground font-medium">Or continue with</span>
                                    </div>
                                </div>

                                <a href="/auth/google">
                                    <Button type="button" variant="outline" size="lg" className="w-full mb-6 group cursor-pointer">
                                        <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span>Sign in with Google</span>
                                    </Button>
                                </a>

                                <div className="text-center text-xs text-muted-foreground mb-4">
                                    Don't have an account?{' '}
                                    <a href="/signup" className="text-primary hover:text-primary/80 font-semibold hover:underline">Sign up now</a>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                                        By logging in, you agree to our{' '}
                                        <button onClick={() => setShowTerms(true)} className="text-primary hover:text-primary/80 font-medium hover:underline cursor-pointer">Terms & Conditions</button>{' '}and{' '}
                                        <button onClick={() => setShowPrivacy(true)} className="text-primary hover:text-primary/80 font-medium hover:underline cursor-pointer">Privacy Policy</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </main>

            {typeof document !== 'undefined' && createPortal(
                <>
                    <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
                    <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
                </>, document.body
            )}
        </div>
    );
}