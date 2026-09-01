import { useForm, router } from '@inertiajs/react';
import Navbar from '../../Components/Common/Navbar.jsx';
import { MailCheck, LogOut } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';

export default function VerifyEmail({ status, email }) {
    const { post, processing } = useForm({});

    const resend = () => post('/email/verification-notification');
    const logout = () => router.post('/logout');

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary via-background to-secondary">
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-10">
                <Card className="w-full max-w-md p-8 shadow-xl text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                        <MailCheck size={26} className="text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">Verify your email</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        We sent a verification link to{' '}
                        <span className="font-medium text-foreground">{email}</span>.
                        Open it to confirm your address. If it isn't in your inbox, check your spam folder.
                    </p>

                    {status && (
                        <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
                            <p className="text-sm text-success font-medium">{status}</p>
                        </div>
                    )}

                    <Button
                        type="button"
                        onClick={resend}
                        disabled={processing}
                        size="lg"
                        className="w-full mb-3"
                    >
                        {processing ? 'Sending...' : 'Resend Verification Email'}
                    </Button>

                    <button
                        type="button"
                        onClick={logout}
                        className="flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        <LogOut size={14} />
                        Log out
                    </button>
                </Card>
            </main>
        </div>
    );
}