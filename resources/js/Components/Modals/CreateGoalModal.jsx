// resources/js/Components/Modals/CreateGoalModal.jsx
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    Target, Smartphone, Gamepad2, Plane, ShoppingBag, PiggyBank,
    Landmark, Umbrella, GraduationCap, ShieldAlert, Sparkles,
} from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';
import { GOAL_THEMES, DEFAULT_GOAL_THEME, resolveGoalTheme } from '@/lib/goalThemes';
import { cn } from '@/lib/utils';
import ModalShell from './ModalShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

const TEMPLATE_PRESETS = {
    'Emergency': {
        title: 'Emergency Fund',
        subtitle: 'For unexpected expenses',
        target_amount: '5000',
        icon_name: 'ShieldAlert',
        color_theme: DEFAULT_GOAL_THEME,
    },
    'Phone': {
        title: 'New Phone',
        subtitle: 'Saving for an upgrade',
        target_amount: '15000',
        icon_name: 'Smartphone',
        color_theme: DEFAULT_GOAL_THEME,
    },
    'Travel': {
        title: 'Travel Fund',
        subtitle: 'Adventure awaits',
        target_amount: '10000',
        icon_name: 'Plane',
        color_theme: DEFAULT_GOAL_THEME,
    },
};

const ICONS = [
    { name: 'PiggyBank', component: PiggyBank },
    { name: 'Target', component: Target },
    { name: 'ShieldAlert', component: ShieldAlert },
    { name: 'Smartphone', component: Smartphone },
    { name: 'Landmark', component: Landmark },
    { name: 'Umbrella', component: Umbrella },
    { name: 'Plane', component: Plane },
    { name: 'ShoppingBag', component: ShoppingBag },
    { name: 'GraduationCap', component: GraduationCap },
    { name: 'Gamepad2', component: Gamepad2 },
];

const THEME_OPTIONS = Object.entries(GOAL_THEMES).map(([key, t]) => ({
    value: key,
    label: t.label,
    swatch: t.bg,
}));

export default function CreateGoalModal({ isOpen, onClose, template = null }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        subtitle: '',
        target_amount: '',
        icon_name: 'PiggyBank',
        color_theme: DEFAULT_GOAL_THEME,
    });

    useEffect(() => {
        if (isOpen && template && TEMPLATE_PRESETS[template]) {
            setData({ ...TEMPLATE_PRESETS[template] });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, template]);

    const isFormValid = data.title.trim().length > 0 && Number(data.target_amount) >= 50;

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (e) => {
        if (e) e.preventDefault();
        clearErrors();
        post('/goals', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    useModalEnterKey({
        isOpen,
        isSuccess: false,
        canSubmit: isFormValid,
        isProcessing: processing,
        onSuccess: onClose,
        onSubmit: () => submit(null),
    });

    const theme = resolveGoalTheme(data.color_theme);
    const ActiveIcon = ICONS.find(i => i.name === data.icon_name)?.component || PiggyBank;

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={handleClose}
            eyebrow="Create new"
            title="Savings Goal"
            icon={Sparkles}
            isProcessing={processing}
            processingLabel="Creating goal…"
            footer={
                <>
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={() => submit(null)} disabled={!isFormValid || processing} className="flex-[2]">
                        <Sparkles size={15} strokeWidth={2.5} /> Create Goal
                    </Button>
                </>
            }
        >
            {/* PREVIEW — one compact line. It exists to confirm the icon and
                colour choice, so it only needs to be as tall as a goal row
                actually is in the list. */}
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-border bg-muted/60 px-3 py-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0', theme.bg)}>
                    <ActiveIcon size={16} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">
                        {data.title || 'Your goal name'}
                    </p>
                    {data.subtitle && (
                        <p className="text-[10px] text-muted-foreground truncate leading-tight">
                            {data.subtitle}
                        </p>
                    )}
                </div>
                <p className="text-xs font-bold text-primary shrink-0 tabular-nums">
                    ₱{data.target_amount ? Number(data.target_amount).toLocaleString('en-US') : '0'}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-3">

                {/* Name and amount share a row — neither needs full width, and
                    pairing them keeps the whole form inside one screen. */}
                <div className="grid grid-cols-5 gap-2.5">
                    <div className="col-span-3">
                        <Label htmlFor="goal-title" className="mb-1 block">
                            Goal name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="goal-title"
                            type="text"
                            required
                            placeholder="e.g. New Phone"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            autoFocus
                            className={cn(errors.title && 'border-destructive focus-visible:ring-destructive/20')}
                        />
                    </div>

                    <div className="col-span-2">
                        <Label htmlFor="goal-target" className="mb-1 block">
                            Target <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground pointer-events-none">₱</span>
                            <Input
                                id="goal-target"
                                type="text"
                                inputMode="numeric"
                                required
                                placeholder="5,000"
                                value={data.target_amount ? Number(data.target_amount).toLocaleString('en-US') : ''}
                                onChange={e => setData('target_amount', e.target.value.replace(/[^0-9]/g, ''))}
                                className={cn('pl-7 font-bold tabular-nums', errors.target_amount && 'border-destructive focus-visible:ring-destructive/20')}
                            />
                        </div>
                    </div>
                </div>

                {(errors.title || errors.target_amount) && (
                    <p className="text-[10px] text-destructive font-semibold">
                        {errors.title || errors.target_amount}
                    </p>
                )}

                <div>
                    <Label htmlFor="goal-subtitle" className="mb-1 block">
                        Description <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                        id="goal-subtitle"
                        type="text"
                        placeholder="e.g. By December 2026"
                        value={data.subtitle}
                        onChange={e => setData('subtitle', e.target.value)}
                    />
                </div>

                {/* Icon */}
                <div>
                    <Label className="mb-1.5 block">Icon</Label>
                    <div className="grid grid-cols-10 gap-1.5">
                        {ICONS.map(({ name, component: Icon }) => (
                            <button
                                type="button"
                                key={name}
                                onClick={() => setData('icon_name', name)}
                                title={name}
                                className={cn(
                                    'aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer border active:scale-95',
                                    data.icon_name === name
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
                                )}
                            >
                                <Icon size={15} strokeWidth={2.5} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colour */}
                <div>
                    <Label className="mb-1.5 block">Colour</Label>
                    <div className="grid grid-cols-8 gap-1.5">
                        {THEME_OPTIONS.map((color) => (
                            <button
                                type="button"
                                key={color.value}
                                onClick={() => setData('color_theme', color.value)}
                                title={color.label}
                                className={cn(
                                    'aspect-square rounded-lg transition-all cursor-pointer active:scale-95',
                                    color.swatch,
                                    data.color_theme === color.value
                                        ? 'ring-2 ring-offset-2 ring-foreground/40 shadow-sm'
                                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                                )}
                            />
                        ))}
                    </div>
                </div>

                <p className="text-[10px] text-muted-foreground">Minimum target ₱50</p>
            </form>
        </ModalShell>
    );
}