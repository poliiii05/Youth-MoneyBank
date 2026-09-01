import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Navbar from '../../Components/Common/Navbar.jsx';
import { Lock, Eye, EyeOff, Check, X, KeyRound } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card } from '@/Components/ui/card';

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]/~`';]/;
const PASSWORD_MIN_LENGTH = 8;

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const longEnough = data.password.length >= PASSWORD_MIN_LENGTH;
    const hasSpecial = SPECIAL_CHAR_REGEX.test(data.password);
    const passwordValid = longEnough && hasSpecial;
    const confirmTouched = data.password_confirmation.length > 0;
    const passwordsMatch = confirmTouched && data.password === data.password_confirmation;
    const canSubmit = passwordValid && passwordsMatch;

    const submit = (e) => {
        e?.preventDefault();
        if (!canSubmit || processing) return;
        post('/reset-password');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-secondary">
            <Navbar currentPage="login" />

            <main className="flex-1 flex items-center justify-center px-4 py-10">
                <Card className="w-full max-w-md p-8 shadow-xl">
                    <div className="text-center mb-6">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                            <KeyRound size={26} className="text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">Set a new password</h1>
                        <p className="text-sm text-muted-foreground">
                            Choose a new password for <span className="font-medium text-foreground">{data.email}</span>
                        </p>
                    </div>

                    {errors.email && (
                        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                            <p className="text-sm text-destructive font-medium">{errors.email}</p>
                        </div>
                    )}

                    {/* NEW PASSWORD */}
                    <div className="mb-4">
                        <Label htmlFor="reset-password" className="mb-2 block">New Password</Label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="reset-password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter a strong password"
                                className="pl-10 pr-10 py-3"
                                autoFocus
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
                                <p className={`text-xs flex items-center gap-1 ${longEnough ? 'text-success' : 'text-muted-foreground'}`}>
                                    {longEnough ? <Check size={12} /> : <X size={12} />} At least 8 characters
                                </p>
                                <p className={`text-xs flex items-center gap-1 ${hasSpecial ? 'text-success' : 'text-muted-foreground'}`}>
                                    {hasSpecial ? <Check size={12} /> : <X size={12} />} At least 1 special character
                                </p>
                            </div>
                        )}
                        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                    </div>

                    {/* CONFIRM */}
                    <div className="mb-6">
                        <Label htmlFor="reset-confirm" className="mb-2 block">Confirm New Password</Label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="reset-confirm"
                                type={showConfirm ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submit(e)}
                                placeholder="Re-enter your password"
                                className="pl-10 pr-10 py-3"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {confirmTouched && !passwordsMatch && (
                            <p className="text-xs text-destructive mt-1">Password did not match.</p>
                        )}
                    </div>

                    <Button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit || processing}
                        size="lg"
                        className="w-full"
                    >
                        {processing ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </Card>
            </main>
        </div>
    );
}