// resources/js/Pages/User/Settings/ProfileTab.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Lock, Check, AlertCircle, MailCheck, MailWarning, UserX, ShieldCheck } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';

const TIER_NAMES = { 1: 'Starter', 2: 'Builder', 3: 'Achiever' };

export default function ProfileTab({ profile }) {
    const [name, setName] = useState(profile.name || '');
    const [birthDate, setBirthDate] = useState(profile.birth_date || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [resending, setResending] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [deactivating, setDeactivating] = useState(false);

    // Birth date can only be set while empty, so it counts as a change only
    // on the pass where it is being filled in for the first time.
    const canSetBirthDate = !profile.birth_date;
    const hasChanges =
        name !== (profile.name || '')
        || (canSetBirthDate && birthDate !== '');
    const tier = Number(profile.kyc_tier || 1);

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => setIsSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleDiscard = () => {
        setName(profile.name || '');
        setBirthDate(profile.birth_date || '');
        setErrors({});
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!hasChanges || isProcessing) return;

        setIsProcessing(true);
        setErrors({});

        router.patch('/settings/profile', {
            name: name.trim(),
            ...(canSetBirthDate && birthDate ? { birth_date: birthDate } : {}),
        }, {
            preserveScroll: true,
            onSuccess: () => { setIsProcessing(false); setIsSuccess(true); },
            onError: (errs) => { setIsProcessing(false); setErrors(errs); },
        });
    };

    const resendVerification = () => {
        setResending(true);
        router.post('/email/verification-notification', {}, {
            preserveScroll: true,
            onFinish: () => setResending(false),
        });
    };

    const hasBalance = Number(profile.total_holdings || 0) > 0;

    const deactivate = () => {
        setDeactivating(true);
        setErrors({});
        router.post('/settings/deactivate', { confirmation: confirmText.trim().toUpperCase() }, {
            preserveScroll: true,
            onError: (errs) => { setDeactivating(false); setErrors(errs); },
            onFinish: () => setDeactivating(false),
        });
    };

    const userInitial = (profile.name || 'U').charAt(0).toUpperCase();

    return (
        <div className="space-y-4">

            {isSuccess && (
                <div className="rounded-xl border border-success/30 bg-success/10 p-3 flex items-center gap-2">
                    <Check size={16} className="text-success" strokeWidth={2.5} />
                    <p className="text-xs font-semibold text-success">Profile updated.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                {/* LEFT COLUMN */}
                <div className="space-y-4">

                    {/* PERSONAL PROFILE */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-foreground mb-4">Personal Profile</h3>

                        <div className="flex items-center gap-3 mb-5">
                            {/* Google avatar URLs expire and can be refused without
                                the right referrer. Without the error fallback a dead
                                URL left a broken-image icon, because the field was
                                still set and the initial avatar never rendered. */}
                            {profile.profile_picture && !avatarFailed ? (
                                <img
                                    src={profile.profile_picture}
                                    alt={profile.name}
                                    referrerPolicy="no-referrer"
                                    onError={() => setAvatarFailed(true)}
                                    className="w-14 h-14 rounded-full border-2 border-card shadow-md object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                                    {userInitial}
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="text-base font-bold text-foreground truncate">{profile.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>

                                <span className={cn(
                                    'inline-flex items-center gap-1 mt-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1',
                                    profile.email_verified
                                        ? 'bg-success/10 text-success ring-success/25'
                                        : 'bg-accent/10 text-accent-foreground ring-accent/30'
                                )}>
                                    {profile.email_verified
                                        ? <><ShieldCheck size={10} strokeWidth={2.5} /> Verified</>
                                        : <><MailWarning size={10} strokeWidth={2.5} /> Unverified</>}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Label htmlFor="profile-name" className="mb-1.5 block">
                                Display name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="profile-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                maxLength={100}
                                className={cn(errors.name && 'border-destructive')}
                            />
                            {errors.name && (
                                <p className="text-[11px] font-semibold text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.name}
                                </p>
                            )}

                            {canSetBirthDate && (
                                <div className="mt-4">
                                    <Label htmlFor="profile-birthdate" className="mb-1.5 block">
                                        Date of birth
                                    </Label>
                                    <Input
                                        id="profile-birthdate"
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className={cn(errors.birth_date && 'border-destructive')}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                        Needed before you can apply for Tier 3, which requires
                                        account holders to be 18 or older. This can only be set
                                        once — contact support if you need it corrected.
                                    </p>
                                    {errors.birth_date && (
                                        <p className="text-[11px] font-semibold text-destructive mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.birth_date}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 justify-end mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDiscard}
                                    disabled={!hasChanges || isProcessing}
                                >
                                    Discard
                                </Button>
                                <Button type="submit" size="sm" disabled={!hasChanges || isProcessing}>
                                    {isProcessing ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* ACCOUNT DETAILS — read-only facts, so they are listed rather
                        than dressed as form fields nobody can edit. */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-foreground mb-4">Account Details</h3>

                        <dl className="divide-y divide-border">
                            <Row label="Account number" mono>{profile.account_number}</Row>
                            <Row label="Email address" locked>{profile.email}</Row>
                            {profile.birth_date && (
                                <Row label="Date of birth" locked>
                                    {new Date(profile.birth_date + 'T00:00:00').toLocaleDateString('en-PH', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                </Row>
                            )}
                            <Row label="Member since">{profile.member_since}</Row>
                            <Row label="Current tier">
                                <span className="text-primary">
                                    Tier {tier} · {TIER_NAMES[tier] || 'Starter'}
                                </span>
                            </Row>
                        </dl>
                    </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">

                    {/* SECURITY — only what the app actually does. No biometric or
                        2FA switches: a toggle that changes nothing is worse than
                        an absent one. */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-foreground mb-4">Security</h3>

                        <div className="rounded-xl border border-border p-3.5">
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                                    profile.email_verified ? 'bg-success/10' : 'bg-accent/10'
                                )}>
                                    {profile.email_verified
                                        ? <MailCheck size={16} className="text-success" strokeWidth={2.5} />
                                        : <MailWarning size={16} className="text-accent-foreground" strokeWidth={2.5} />}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-foreground">Email verification</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                                        {profile.email_verified
                                            ? 'Your email address is confirmed. Password resets go here.'
                                            : 'Confirm your email so you can recover your account if you lose your password.'}
                                    </p>

                                    {!profile.email_verified && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resendVerification}
                                            disabled={resending}
                                            className="mt-2.5"
                                        >
                                            {resending ? 'Sending…' : 'Resend verification email'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-3">
                            Passwords are hashed with bcrypt and sessions are encrypted.
                            To change your password, use the “Forgot password?” link on
                            the login page.
                        </p>
                    </Card>

                    {/* DEACTIVATE — signing out lives in the profile menu; a
                        red panel here is for the decision that actually needs
                        weighing. */}
                    <Card className="p-5 border-destructive/25">
                        <h3 className="text-sm font-bold text-foreground mb-1">Deactivate account</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                            Closes your account and ends your session. Your transaction
                            history is kept for the audit trail rather than erased, and
                            support can reopen the account later.
                        </p>

                        {hasBalance ? (
                            <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
                                <p className="text-[11px] text-accent-foreground leading-relaxed">
                                    <span className="font-bold">
                                        ₱{Number(profile.total_holdings).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>{' '}
                                    is still in your account. Withdraw it before
                                    deactivating so nothing is left behind a closed login.
                                </p>
                            </div>
                        ) : !confirming ? (
                            <Button
                                variant="outline"
                                onClick={() => setConfirming(true)}
                                className="w-full border-destructive/40 text-destructive hover:bg-destructive/5"
                            >
                                <UserX size={15} strokeWidth={2.5} /> Deactivate account
                            </Button>
                        ) : (
                            <div className="space-y-2.5">
                                <Label htmlFor="deactivate-confirm" className="block">
                                    Type <span className="font-black text-destructive">DEACTIVATE</span> to confirm
                                </Label>
                                <Input
                                    id="deactivate-confirm"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DEACTIVATE"
                                    autoComplete="off"
                                    autoFocus
                                    className="font-bold tracking-widest uppercase"
                                />
                                {errors.confirmation && (
                                    <p className="text-[11px] font-semibold text-destructive flex items-start gap-1">
                                        <AlertCircle size={12} className="mt-0.5 shrink-0" /> {errors.confirmation}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setConfirming(false); setConfirmText(''); setErrors({}); }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={deactivate}
                                        disabled={confirmText.trim().toUpperCase() !== 'DEACTIVATE' || deactivating}
                                        className="flex-1"
                                    >
                                        {deactivating ? 'Closing…' : 'Deactivate'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Row({ label, children, mono = false, locked = false }) {
    return (
        <div className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text-xs text-muted-foreground shrink-0">{label}</dt>
            <dd className={cn(
                'text-xs font-bold text-foreground text-right truncate tabular-nums',
                mono && 'font-mono'
            )}>
                {children}
                {locked && <Lock size={11} className="inline ml-1.5 text-muted-foreground align-middle" />}
            </dd>
        </div>
    );
}