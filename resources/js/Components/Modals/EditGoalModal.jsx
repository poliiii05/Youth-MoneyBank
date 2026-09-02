// resources/js/Components/Modals/EditGoalModal.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Target, ShieldAlert, Smartphone, ShoppingBag, PiggyBank,
    Landmark, Umbrella, GraduationCap, Gamepad2, Plane, Edit2,
} from 'lucide-react';
import { useModalEnterKey } from '../../Hooks/useModalEnterKey';
import { GOAL_THEMES, DEFAULT_GOAL_THEME, resolveGoalTheme } from '@/lib/goalThemes';
import { cn } from '@/lib/utils';
import ModalShell from './ModalShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

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

export default function EditGoalModal({ isOpen, onClose, goal }) {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [iconName, setIconName] = useState('Target');
    const [colorTheme, setColorTheme] = useState(DEFAULT_GOAL_THEME);
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && goal) {
            setTitle(goal.title || '');
            setSubtitle(goal.subtitle || '');
            setTargetAmount((goal.target_amount || 0).toLocaleString('en-US'));
            setIconName(goal.icon_name || 'Target');
            setColorTheme(goal.color_theme || DEFAULT_GOAL_THEME);
            setErrors({});
            setIsSuccess(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, goal?.id]);

    const numericTarget = Number(targetAmount.replace(/,/g, '')) || 0;
    const currentAmount = goal?.current_amount || 0;
    const isTargetValid = numericTarget >= currentAmount && numericTarget >= 1;
    const isFormValid = title.trim().length > 0 && isTargetValid;

    const handleSubmit = () => {
        if (!isFormValid || isProcessing) return;
        setIsProcessing(true);
        setErrors({});
        router.post(`/goals/${goal.id}/update`, {
            title: title.trim(),
            subtitle: subtitle.trim() || null,
            target_amount: numericTarget,
            icon_name: iconName,
            color_theme: colorTheme,
        }, {
            preserveScroll: true,
            onSuccess: () => { setIsProcessing(false); setIsSuccess(true); },
            onError: (errs) => { setIsProcessing(false); setErrors(errs); },
        });
    };

    useModalEnterKey({
        isOpen,
        isSuccess,
        canSubmit: isFormValid,
        isProcessing,
        onSuccess: onClose,
        onSubmit: handleSubmit,
    });

    const handleTargetChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        if (!raw) {
            setTargetAmount('');
            setErrors({ ...errors, target_amount: null });
            return;
        }
        const value = Number(raw);
        setTargetAmount(value.toLocaleString('en-US'));

        // A target below what is already allocated would leave the goal
        // over-funded against its own ceiling, so it is refused here rather
        // than only at the server.
        setErrors({
            ...errors,
            target_amount: value < currentAmount
                ? `Cannot be below the ₱${currentAmount.toLocaleString('en-US')} already allocated. Unallocate first.`
                : null,
        });
    };

    const theme = resolveGoalTheme(colorTheme);
    const ActiveIcon = ICONS.find(i => i.name === iconName)?.component || Target;

    if (!goal) return null;

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            eyebrow="Edit"
            title={goal.title}
            icon={Edit2}
            isProcessing={isProcessing}
            processingLabel="Saving changes…"
            success={isSuccess ? {
                title: 'Goal updated',
                message: 'Your changes have been saved.',
            } : null}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isFormValid || isProcessing} className="flex-[2]">
                        Save Changes
                    </Button>
                </>
            }
        >
            {/* PREVIEW */}
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-border bg-muted/60 px-3 py-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0', theme.bg)}>
                    <ActiveIcon size={16} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">
                        {title || 'Your goal name'}
                    </p>
                    {subtitle && (
                        <p className="text-[10px] text-muted-foreground truncate leading-tight">{subtitle}</p>
                    )}
                </div>
                <p className="text-xs font-bold text-primary shrink-0 tabular-nums">
                    ₱{numericTarget.toLocaleString('en-US')}
                </p>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2.5">
                    <div className="col-span-3">
                        <Label htmlFor="edit-title" className="mb-1 block">
                            Goal name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            autoFocus
                            className={cn(errors.title && 'border-destructive')}
                        />
                    </div>

                    <div className="col-span-2">
                        <Label htmlFor="edit-target" className="mb-1 block">
                            Target <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground pointer-events-none">₱</span>
                            <Input
                                id="edit-target"
                                type="text"
                                inputMode="numeric"
                                value={targetAmount}
                                onChange={handleTargetChange}
                                className={cn('pl-7 font-bold tabular-nums', errors.target_amount && 'border-destructive')}
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
                    <Label htmlFor="edit-subtitle" className="mb-1 block">
                        Description <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                        id="edit-subtitle"
                        type="text"
                        placeholder="e.g. By December 2026"
                        value={subtitle}
                        onChange={e => setSubtitle(e.target.value)}
                    />
                </div>

                <div>
                    <Label className="mb-1.5 block">Icon</Label>
                    <div className="grid grid-cols-10 gap-1.5">
                        {ICONS.map(({ name, component: Icon }) => (
                            <button
                                type="button"
                                key={name}
                                onClick={() => setIconName(name)}
                                title={name}
                                className={cn(
                                    'aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer border active:scale-95',
                                    iconName === name
                                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                        : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
                                )}
                            >
                                <Icon size={15} strokeWidth={2.5} />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="mb-1.5 block">Colour</Label>
                    <div className="grid grid-cols-8 gap-1.5">
                        {THEME_OPTIONS.map((color) => (
                            <button
                                type="button"
                                key={color.value}
                                onClick={() => setColorTheme(color.value)}
                                title={color.label}
                                className={cn(
                                    'aspect-square rounded-lg transition-all cursor-pointer active:scale-95',
                                    color.swatch,
                                    colorTheme === color.value
                                        ? 'ring-2 ring-offset-2 ring-foreground/40 shadow-sm'
                                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                                )}
                            />
                        ))}
                    </div>
                </div>

                {currentAmount > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                        ₱{currentAmount.toLocaleString('en-US')} is already allocated to this goal.
                    </p>
                )}
            </div>
        </ModalShell>
    );
}