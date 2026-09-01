import { useForm, Link } from '@inertiajs/react';
import Navbar from '../../Components/Common/Navbar.jsx';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card } from '@/Components/ui/card';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const emailValid = EMAIL_REGEX.test(data.email);

    const submit = (e) => {
        e?.preventDefault();
        if (!emailValid || processing) return;
        post('/forgot-password');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-secondary">
            <Navbar currentPage="login" />

            <main className="flex-1 flex items-center justify-center px-4 py-10">
                <Card className="w-full max-w-md p-8 shadow-xl">
                    <div className="text-center mb-6">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                            <Mail size={26} className="text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">Forgot your password?</h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Enter the email address on your account and we'll send you a link to set a new password.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
                            <p className="text-sm text-success font-medium">{status}</p>
                        </div>
                    )}

                    <div className="mb-5">
                        <Label htmlFor="forgot-email" className="mb-2 block">Email Address</Label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="forgot-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submit(e)}
                                placeholder="you@example.com"
                                className="pl-10 py-3"
                                autoFocus
                            />
                        </div>
                        {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
                    </div>

                    <Button
                        type="button"
                        onClick={submit}
                        disabled={!emailValid || processing}
                        size="lg"
                        className="w-full mb-5"
                    >
                        {processing ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to login
                    </Link>
                </Card>
            </main>
        </div>
    );
}