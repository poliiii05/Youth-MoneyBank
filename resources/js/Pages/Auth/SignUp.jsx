import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useForm, Link, router } from '@inertiajs/react';
import Navbar from '../../Components/Common/Navbar.jsx';
import PrivacyPolicyModal from '../../Pages/Public/PrivacyPolicyModal.jsx';
import TermsAndConditionsModal from '../../Pages/Public/TermsAndConditionsModal.jsx';
import { Wallet, Target, TrendingUp, ChevronDown, Mail, User, Lock, Eye, EyeOff, Check, X, MailCheck } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card } from '@/Components/ui/card';
import { showError } from '../../utils/toast.jsx';
import { EMAIL_REGEX, validateEmail } from '../../utils/email.js';

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]/~`';]/;
const PASSWORD_MIN_LENGTH = 8;

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

/**
 * Turnstile in "execute" mode.
 *
 * The widget renders invisibly and only runs when execute() is called, so
 * nothing appears on the form until the visitor submits. When Cloudflare
 * decides a challenge is needed, it shows its own centred overlay — that UI
 * is Cloudflare's, not ours, which is the point: people trust the check
 * because they recognise it from other sites.
 */
function TurnstileGate({ siteKey, onVerify, onError, registerExecute, active }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);

    // turnstile.render() captures its callbacks once, at mount. Reading them
    // through refs keeps the widget pointed at the current handlers instead
    // of the ones from the first render, when the form was still empty.
    const onVerifyRef = useRef(onVerify);
    const onErrorRef = useRef(onError);
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;

    useEffect(() => {
        if (!siteKey) return;
        let cancelled = false;

        const render = () => {
            if (cancelled || !containerRef.current) return;
            if (!window.turnstile) {
                setTimeout(render, 120);
                return;
            }
            if (widgetIdRef.current !== null) return;

            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                theme: 'light',
                appearance: 'execute',   // stay hidden until execute() runs
                execution: 'execute',
                callback: (token) => onVerifyRef.current(token),
                'error-callback': () => onErrorRef.current('Verification failed. Please try again.'),
                'timeout-callback': () => onErrorRef.current('Verification timed out. Please try again.'),
            });

            // Hand the parent a way to trigger the check, plus a reset for
            // retries — Turnstile tokens are single-use.
            registerExecute({
                run: () => window.turnstile.execute(widgetIdRef.current),
                reset: () => window.turnstile.reset(widgetIdRef.current),
            });
        };

        if (!document.querySelector('script[src*="turnstile"]')) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.onload = render;
            document.head.appendChild(script);
        } else {
            render();
        }

        return () => {
            cancelled = true;
            if (window.turnstile && widgetIdRef.current !== null) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    // already gone
                }
                widgetIdRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteKey]);

    // The widget must stay mounted for its id to stay valid, so it is always
    // in the tree — hidden until a check is running, then shown centred over
    // a dimmed page. Cloudflare draws its own UI inside; we only position it.
    return (
        <>
            {active && (
                <div className="fixed inset-0 z-50 bg-black/40" aria-hidden="true" />
            )}
            <div
                className={
                    active
                        ? 'fixed inset-0 z-50 flex items-center justify-center p-4'
                        : 'hidden'
                }
            >
                <div ref={containerRef} />
            </div>
        </>
    );
}

/**
 * Shown once registration succeeds. Deliberately a modal rather than a toast:
 * the visitor has to acknowledge it, so the instruction to go check their
 * email can't scroll past unread.
 */
function RegistrationSuccessModal({ email }) {
    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-sm p-8 text-center shadow-2xl">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                        <MailCheck size={26} className="text-success" />
                    </div>

                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Sign up successful!
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        We sent a verification link to{' '}
                        <span className="font-medium text-foreground break-all">{email}</span>.
                        Open it to verify your account, then log in.
                    </p>

                    <Button
                        type="button"
                        size="lg"
                        className="w-full"
                        autoFocus
                        onClick={() => router.visit('/login')}
                    >
                        Okay
                    </Button>
                </Card>
            </div>
        </>
    );
}

export default function SignUp({ turnstileSiteKey, registeredEmail }) {
    const { data, setData, post, transform, processing, errors } = useForm({
        name: '',
        email: '',
        birth_date: '',
        password: '',
        password_confirmation: '',
        turnstile_token: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // BIRTHDAY PICKER STATES
    const [bMonth, setBMonth] = useState('');
    const [bDay, setBDay] = useState('');
    const [bYear, setBYear] = useState('');

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const emailValid = EMAIL_REGEX.test(data.email.trim());
    const { error: emailError, suggestion: emailSuggestion } = validateEmail(data.email, emailTouched);
    const passwordLongEnough = data.password.length >= PASSWORD_MIN_LENGTH;
    const passwordHasSpecialChar = SPECIAL_CHAR_REGEX.test(data.password);
    const passwordValid = passwordLongEnough && passwordHasSpecialChar;
    const passwordsMatch = data.password_confirmation.length > 0
        && data.password === data.password_confirmation;

    // While the confirmation is still a prefix of the password, the visitor is
    // simply mid-typing — flagging that as a mismatch is just noise. The error
    // only appears once what they've typed can no longer become a match.
    const confirmDiverged = data.password_confirmation.length > 0
        && !data.password.startsWith(data.password_confirmation);

    // SYNC 3 DROPDOWNS TO 1 DATE STRING
    useEffect(() => {
        if (bMonth && bDay && bYear) {
            const formattedMonth = bMonth.padStart(2, '0');
            const formattedDay = bDay.padStart(2, '0');
            setData('birth_date', `${bYear}-${formattedMonth}-${formattedDay}`);
        } else {
            setData('birth_date', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Filled in by TurnstileGate once its widget is ready.
    const turnstileRef = useRef(null);
    const registerExecute = useCallback((api) => {
        turnstileRef.current = api;
    }, []);

    // Cloudflare hands back a token — merge it into the payload and submit.
    // transform() is the supported way to add a field at submit time; passing
    // `data` through post() options does not reach the request.
    const handleTurnstileVerify = (token) => {
        // Cloudflare has just swapped its widget to the green tick — leave the
        // overlay up briefly so the visitor sees it succeed rather than having
        // the panel vanish mid-animation.
        setTimeout(() => {
            setVerifying(false);
            transform((current) => ({ ...current, turnstile_token: token }));
            post('/signup', {
                onError: () => {
                    // The token was spent on the failed attempt; the next
                    // submit needs a fresh one.
                    turnstileRef.current?.reset();
                },
            });
        }, 900);
    };

    const handleTurnstileError = (message) => {
        setVerifying(false);
        showError(message);
        turnstileRef.current?.reset();
    };

    const handleSignUp = () => {
        if (!isFormValid() || processing || verifying) return;

        // No Turnstile configured locally — go straight through.
        if (!turnstileSiteKey || !turnstileRef.current) {
            post('/signup');
            return;
        }

        setVerifying(true);
        turnstileRef.current.run();
    };

    const isFormValid = () => {
        return (
            data.name.trim().length > 0 &&
            emailValid &&
            data.birth_date &&
            passwordValid &&
            passwordsMatch &&
            acceptedTerms
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-secondary">
            <Navbar currentPage="signup" />

            <main className="flex-1 flex items-center justify-center px-4 py-4">
                <Card className="w-full max-w-5xl rounded-3xl shadow-2xl border-border overflow-hidden p-0">
                    <div className="flex h-full min-h-[460px]">

                        {/* LEFT SIDE */}
                        <div className="hidden lg:flex w-1/2 flex-col justify-center p-6 lg:p-8 bg-gradient-to-br from-primary via-primary to-emerald-500 text-primary-foreground relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-4">
                                    <span className="text-accent text-[11px] font-bold uppercase tracking-wider">Start Saving Today</span>
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 tracking-tight">
                                    Join Youth<br />MoneyBank
                                </h1>

                                <p className="text-sm text-white/90 mb-6 pr-4 leading-relaxed">
                                    Start your financial journey and take control of your future with secure, progressive savings.
                                </p>

                                <div className="space-y-3">
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <Wallet size={20} className="mt-0.5 text-accent shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm mb-0.5">Smart Savings Goals</h3>
                                                <p className="text-xs text-white/85">Create custom stashes and watch your money grow.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <Target size={20} className="mt-0.5 text-accent shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm mb-0.5">Track Allowances & Spending</h3>
                                                <p className="text-xs text-white/85">Monitor your daily expenses and incoming allowances.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                        <div className="flex items-start gap-3">
                                            <TrendingUp size={20} className="mt-0.5 text-accent shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm mb-0.5">Progressive Account Tiers</h3>
                                                <p className="text-xs text-white/85">Start with just your email and upgrade as you grow.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-white/20">
                                    <p className="text-sm font-semibold">Built with Bank-Level Security</p>
                                    <p className="text-xs text-white/80 mt-0.5">Simulated Platform. Safe. Secure.</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE - FORM */}
                        <div className="w-full lg:w-1/2 p-5 lg:p-7 flex flex-col justify-center bg-card overflow-y-auto">
                            <div className="max-w-[400px] mx-auto w-full">
                                <div className="text-center mb-4">
                                    <h2 className="text-2xl font-bold text-foreground mb-1">Create Account</h2>
                                    <p className="text-sm text-muted-foreground">Get started in just a few steps</p>
                                </div>

                                {/* FULL NAME */}
                                <div className="mb-2.5">
                                    <Label htmlFor="signup-fullname" className="mb-1 block">Full Name <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="signup-fullname"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Juan Dela Cruz"
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                                </div>

                                {/* EMAIL */}
                                <div className="mb-2.5">
                                    <Label htmlFor="signup-email" className="mb-1 block">Email Address <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            onBlur={() => setEmailTouched(true)}
                                            placeholder="you@example.com"
                                            className="pl-10"
                                        />
                                    </div>
                                    {emailSuggestion && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Did you mean{' '}
                                            <button
                                                type="button"
                                                onClick={() => { setData('email', emailSuggestion); setEmailTouched(true); }}
                                                className="text-primary font-semibold hover:underline cursor-pointer"
                                            >
                                                {emailSuggestion}
                                            </button>
                                            ?
                                        </p>
                                    )}
                                    {!emailSuggestion && emailError && (
                                        <p className="text-xs text-destructive mt-1">{emailError}</p>
                                    )}
                                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                                </div>

                                {/* DATE OF BIRTH — right below email */}
                                <div className="mb-2.5">
                                    <Label className="mb-1 block">Date of Birth <span className="text-destructive">*</span></Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="relative">
                                            <select value={bMonth} onChange={(e) => setBMonth(e.target.value)} className={`w-full pl-3 pr-8 py-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-ring outline-none transition-all appearance-none bg-background ${!bMonth ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                <option value="" disabled>Month</option>
                                                {months.map(m => <option key={m.value} value={m.value} className="text-foreground">{m.label}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        </div>

                                        <div className="relative">
                                            <select value={bDay} onChange={(e) => setBDay(e.target.value)} className={`w-full pl-3 pr-8 py-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-ring outline-none transition-all appearance-none bg-background ${!bDay ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                <option value="" disabled>Day</option>
                                                {days.map(d => <option key={d} value={d} className="text-foreground">{d}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        </div>

                                        <div className="relative">
                                            <select value={bYear} onChange={(e) => setBYear(e.target.value)} className={`w-full pl-3 pr-8 py-2 text-sm border border-input rounded-md focus:ring-2 focus:ring-ring outline-none transition-all appearance-none bg-background ${!bYear ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                <option value="" disabled>Year</option>
                                                {years.map(y => <option key={y} value={y} className="text-foreground">{y}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* PASSWORD */}
                                <div className="mb-2.5">
                                    <Label htmlFor="signup-password" className="mb-1 block">Password <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="signup-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter a strong password"
                                            className="pl-10 pr-10"
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
                                    {data.password.length > 0 && (
                                        <div className="mt-1.5 space-y-0.5">
                                            <p className={`text-xs flex items-center gap-1 ${passwordLongEnough ? 'text-success' : 'text-muted-foreground'}`}>
                                                {passwordLongEnough ? <Check size={12} /> : <X size={12} />} At least 8 characters
                                            </p>
                                            <p className={`text-xs flex items-center gap-1 ${passwordHasSpecialChar ? 'text-success' : 'text-muted-foreground'}`}>
                                                {passwordHasSpecialChar ? <Check size={12} /> : <X size={12} />} At least 1 special character
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* CONFIRM PASSWORD */}
                                <div className="mb-3">
                                    <Label htmlFor="signup-confirm-password" className="mb-1 block">Confirm Password <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="signup-confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Re-enter your password"
                                            className="pl-10 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {confirmDiverged && (
                                        <p className="text-xs text-destructive mt-1">Password did not match.</p>
                                    )}
                                </div>

                                {/* TERMS CHECKBOX */}
                                <div className="flex items-start gap-2 bg-secondary p-2 rounded-lg border border-border mb-4">
                                    <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5 w-3.5 h-3.5 rounded border-input text-primary focus:ring-ring cursor-pointer" />
                                    <label htmlFor="terms" className="text-xs text-secondary-foreground leading-tight cursor-pointer select-none">
                                        I agree to the <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-primary hover:underline font-bold">Terms & Conditions</button> and <button onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-primary hover:underline font-bold">Privacy Policy</button>
                                    </label>
                                </div>

                                {errors.birth_date && <p className="text-xs text-destructive mb-2">{errors.birth_date}</p>}

                                <TurnstileGate
                                    siteKey={turnstileSiteKey}
                                    onVerify={handleTurnstileVerify}
                                    onError={handleTurnstileError}
                                    registerExecute={registerExecute}
                                    active={verifying}
                                />
                                {errors.turnstile_token && (
                                    <p className="text-xs text-destructive mb-2 text-center">{errors.turnstile_token}</p>
                                )}

                                <Button type="button" onClick={handleSignUp} disabled={!isFormValid() || processing || verifying} size="lg" className="w-full mb-3">
                                    {verifying ? 'Verifying...' : processing ? 'Creating Account...' : 'Create Account'}
                                </Button>

                                <div className="relative my-3">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                                    <div className="relative flex justify-center text-xs"><span className="px-3 bg-card text-muted-foreground font-medium">Or sign up with</span></div>
                                </div>

                                <a href="/auth/google">
                                    <Button type="button" variant="outline" size="lg" className="w-full mb-3">
                                        <GoogleIcon />
                                        <span>Sign up with Google</span>
                                    </Button>
                                </a>

                                <div className="text-center text-xs text-muted-foreground">
                                    Already have an account? <Link href="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline">Login here</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </main>

            {registeredEmail && <RegistrationSuccessModal email={registeredEmail} />}

            {typeof document !== 'undefined' && createPortal(
                <>
                    <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
                    <TermsAndConditionsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
                </>, document.body
            )}
        </div>
    );
} 