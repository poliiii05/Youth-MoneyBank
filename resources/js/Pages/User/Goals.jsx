// resources/js/Pages/User/Goals.jsx
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import CreateGoalModal from '../../Components/Modals/CreateGoalModal';
import AllocateFundsModal from '../../Components/Modals/AllocateFundsModal';
import TransferToSavingsModal from '../../Components/Modals/TransferToSavingsModal';
import WithdrawFromSavingsModal from '../../Components/Modals/WithdrawFromSavingsModal';
import DeallocateFundsModal from '../../Components/Modals/DeallocateFundsModal';
import EditGoalModal from '../../Components/Modals/EditGoalModal';
import DeleteGoalModal from '../../Components/Modals/DeleteGoalModal';
import ViewDetailsModal from '../../Components/Modals/ViewDetailsModal';
import { 
    Target, Plus, ShieldAlert, Smartphone, ShoppingBag, MoreVertical, 
    Edit2, Trash2, PlusCircle, PiggyBank, ArrowUpRight, ArrowDownLeft, 
    Landmark, Umbrella, GraduationCap, Gamepad2, Plane, PartyPopper 
} from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { resolveGoalTheme } from '@/lib/goalThemes';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/Components/ui/dropdown-menu';
import useCountUp from '@/Hooks/useCountUp';

export default function Goals({ auth, finances, goals }) {
    const user = auth?.user;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [allocatingGoal, setAllocatingGoal] = useState(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [deallocatingGoal, setDeallocatingGoal] = useState(null);
    const [editingGoal, setEditingGoal] = useState(null);
    const [deletingGoal, setDeletingGoal] = useState(null);
    const [viewingGoalId, setViewingGoalId] = useState(null);
    const [activeTemplate, setActiveTemplate] = useState(null);

    // Same count-up the landing page uses on its showcase balance — here it
    // runs on the real figure, so arriving at the page shows the total
    // building rather than simply appearing.
    const animatedSavings = useCountUp(finances?.total_savings || 0);

    // Flipped one frame after mount so the progress bars have a zero width to
    // transition away from.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        const raf = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    // A goal that hit its target was previously left in the active list with a
    // dead "Goal Reached!" button, so finished work kept competing for
    // attention with unfinished work. Derived here rather than stored: no
    // migration, and it can never fall out of step with the amounts.
    const reachedGoals = (goals || []).filter(g => g.current_amount >= g.target_amount && g.target_amount > 0);
    const activeGoals = (goals || [])
        .filter(g => !(g.current_amount >= g.target_amount && g.target_amount > 0))
        // Closest to finishing first — the one worth another ₱50 today.
        .sort((a, b) => {
            const pa = a.target_amount > 0 ? a.current_amount / a.target_amount : 0;
            const pb = b.target_amount > 0 ? b.current_amount / b.target_amount : 0;
            return pb - pa;
        });

    const openAllocateModal = (goal) => setAllocatingGoal(goal);
    const closeAllocateModal = () => setAllocatingGoal(null);
    const openDeallocateModal = (goal) => setDeallocatingGoal(goal);
    const closeDeallocateModal = () => setDeallocatingGoal(null);
    const openEditModal = (goal) => setEditingGoal(goal);
    const closeEditModal = () => setEditingGoal(null);
    const openDeleteModal = (goal) => setDeletingGoal(goal);
    const closeDeleteModal = () => setDeletingGoal(null);
    const openViewModal = (goal) => setViewingGoalId(goal.id);
    const closeViewModal = () => setViewingGoalId(null);

    // Handle ?template=Emergency URL param
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const template = urlParams.get('template');
        
        if (template) {
            setActiveTemplate(template);
            setIsCreateModalOpen(true);
            window.history.replaceState({}, '', '/goals');
        }
    }, []);

    const renderIcon = (iconName, className) => {
        switch(iconName) {
            case 'ShieldAlert': return <ShieldAlert className={className} />;
            case 'Smartphone': return <Smartphone className={className} />;
            case 'ShoppingBag': return <ShoppingBag className={className} />;
            case 'PiggyBank': return <PiggyBank className={className} />;
            case 'Landmark': return <Landmark className={className} />;
            case 'Umbrella': return <Umbrella className={className} />;
            case 'GraduationCap': return <GraduationCap className={className} />;
            case 'Gamepad2': return <Gamepad2 className={className} />;
            case 'Plane': return <Plane className={className} />;
            default: return <Target className={className} />;
        }
    };

    return (
        <UserLayout user={user} header="Savings">
            <Head title="Savings Goals | Youth MoneyBank" />

            <div className="max-w-6xl mx-auto">
                {/* 1. SAVINGS OVERVIEW with Add/Withdraw actions */}
                <Card className="p-6 mb-8">

                    {/* Balance and the two actions that move it share a row —
                        the actions used to sit in a band underneath, which left
                        the space beside the figure empty and the card taller
                        than it needed to be. */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground tracking-widest mb-1">TOTAL SAVINGS</p> 
                            <h2 className="text-4xl font-bold text-foreground tracking-tight tabular-nums">
                                ₱{animatedSavings.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}<span className="text-2xl text-muted-foreground font-semibold">.00</span>
                            </h2>
                            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Includes funds in your goals</p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                variant="secondary"
                                onClick={() => setIsTransferModalOpen(true)}
                                className="flex-1 sm:flex-none border border-primary/20"
                            >
                                <ArrowDownLeft size={16} strokeWidth={2.5} /> Transfer to Savings
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsWithdrawModalOpen(true)}
                                disabled={(finances?.unallocated || 0) <= 0}
                                className="flex-1 sm:flex-none"
                            >
                                <ArrowUpRight size={16} strokeWidth={2.5} /> Withdraw
                            </Button>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="flex flex-col sm:flex-row gap-6 pt-5 mt-5 border-t border-border">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                            <p className="text-sm text-muted-foreground font-medium">
                                In Goals: <span className="font-bold text-foreground tabular-nums">
                                    ₱{(finances?.allocated || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300"></div>
                            <p className="text-sm text-muted-foreground font-medium">
                                Available: <span className="font-bold text-foreground tabular-nums">
                                    ₱{(finances?.unallocated || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </span>
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 2. GOAL CARDS GRID */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-3">
                            <h3 className="text-base font-bold text-foreground">Active Goals</h3>
                            {activeGoals.length > 0 && (
                                <span className="text-xs font-semibold text-muted-foreground">
                                    {activeGoals.length} in progress
                                </span>
                            )}
                        </div>

                        {/* Sits with the list it adds to, rather than in the balance
                            card above, which is about money already saved. */}
                        <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(true)} className="text-primary">
                            <Plus size={16} strokeWidth={2.5} /> Add New Goal
                        </Button>
                    </div>
                    
                    {activeGoals.length > 0 ? (
                        <div className="space-y-3">

                            {activeGoals.map((goal, index) => {
                                const percentage = goal.target_amount > 0 
                                    ? (goal.current_amount / goal.target_amount) * 100 
                                    : 0;
                                const theme = resolveGoalTheme(goal.color_theme);

                                return (
                                    <Card
                                        key={goal.id}
                                        className="ymb-row-enter flex items-center gap-4 p-4 hover:border-primary/40 hover:shadow-md transition-all group"
                                        style={{ animationDelay: `${index * 60}ms` }}
                                    >
                                        {/* IDENTITY */}
                                        <div className="flex items-center gap-3 min-w-0 w-full sm:w-56 shrink-0">
                                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0', theme.bg)}>
                                                {renderIcon(goal.icon_name, 'w-5 h-5')}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-foreground text-sm leading-tight truncate">
                                                    {goal.title}
                                                </h3>
                                                <p className="text-[11px] text-muted-foreground font-medium tabular-nums">
                                                    {percentage.toFixed(1)}% complete
                                                </p>
                                            </div>
                                        </div>

                                        {/* PROGRESS — takes the slack, so the row reads
                                            the same whether there is one goal or ten. */}
                                        <div className="hidden sm:block flex-1 min-w-0">
                                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                {/* Width starts at 0 and is set after mount, so the
                                                    bar visibly fills rather than appearing already
                                                    full — the same read the landing showcase gives. */}
                                                <div
                                                    className={cn('h-2 rounded-full transition-[width] duration-1000 ease-out', theme.bg)}
                                                    style={{ width: mounted ? `${Math.min(percentage, 100)}%` : '0%' }}
                                                />
                                            </div>
                                        </div>

                                        {/* AMOUNTS */}
                                        <div className="text-right shrink-0 hidden sm:block">
                                            <p className="text-sm font-bold text-foreground tabular-nums leading-tight">
                                                ₱{Number(goal.current_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground tabular-nums">
                                                of ₱{Number(goal.target_amount).toLocaleString('en-PH')}
                                            </p>
                                        </div>

                                        {/* ACTIONS — kept in the row so adding money, the
                                            whole point of the page, never needs a detour. */}
                                        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
                                            <Button
                                                size="sm"
                                                onClick={() => openAllocateModal(goal)}
                                                className="hidden sm:inline-flex"
                                            >
                                                <PlusCircle size={14} strokeWidth={2.5} /> Add Funds
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openViewModal(goal)}
                                                className="hidden lg:inline-flex text-muted-foreground"
                                            >
                                                View
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        aria-label={`Options for ${goal.title}`}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onSelect={() => openAllocateModal(goal)}
                                                        className="sm:hidden"
                                                    >
                                                        <PlusCircle size={14} /> Add Funds
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={() => openViewModal(goal)}
                                                        className="lg:hidden"
                                                    >
                                                        <Target size={14} /> View Details
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onSelect={() => openDeallocateModal(goal)}
                                                        disabled={goal.current_amount <= 0}
                                                    >
                                                        <ArrowUpRight size={14} /> Unallocate Funds
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onSelect={() => openEditModal(goal)}>
                                                        <Edit2 size={14} /> Edit Goal
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem destructive onSelect={() => openDeleteModal(goal)}>
                                                        <Trash2 size={14} /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </Card>
                                );
                            })}

                        </div>
                    ) : (
                        <div>
                            {/* Subtle hint header */}
                            <p className="text-xs text-muted-foreground font-medium mb-4 text-center">
                                Pick a template to get started, or create a custom goal →
                            </p>

                            {/* Template cards — ALL EMERALD */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { 
                                        template: 'Emergency', 
                                        title: 'Emergency Fund', 
                                        subtitle: 'For unexpected expenses',
                                        target: 5000,
                                        icon: 'ShieldAlert',
                                    },
                                    { 
                                        template: 'Phone', 
                                        title: 'New Phone', 
                                        subtitle: 'Saving for an upgrade',
                                        target: 15000,
                                        icon: 'Smartphone',
                                    },
                                    { 
                                        template: 'Travel', 
                                        title: 'Travel Fund', 
                                        subtitle: 'Adventure awaits',
                                        target: 10000,
                                        icon: 'Plane',
                                    },
                                ].map((tpl) => (
                                    <div 
                                        key={tpl.template}
                                        className="bg-card rounded-2xl shadow-sm border-2 border-dashed border-border p-5 flex flex-col gap-4 hover:border-primary hover:bg-secondary/40 transition-all group cursor-pointer active:scale-[0.98]"
                                        onClick={() => {
                                            setActiveTemplate(tpl.template);
                                            setIsCreateModalOpen(true);
                                        }}
                                    >
                                        {/* HEADER */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm bg-primary">
                                                    {renderIcon(tpl.icon, "w-6 h-6")}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-foreground leading-tight truncate max-w-[150px]">{tpl.title}</h3>
                                                    <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[150px]">{tpl.subtitle}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-muted text-muted-foreground shrink-0">
                                                Template
                                            </span>
                                        </div>

                                        {/* PROGRESS placeholder */}
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">SAVED</p>
                                                    <p className="text-xl font-bold text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>₱0.00</p>
                                                </div>
                                                <p className="text-xs font-bold text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                    / ₱{tpl.target.toLocaleString('en-PH')}
                                                </p>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                <div className="h-2 rounded-full bg-muted-foreground/30" style={{ width: '2%' }}></div>
                                            </div>
                                            <p className="text-[10px] font-bold text-muted-foreground mt-2">
                                                Not started
                                            </p>
                                        </div>

                                        {/* CTA button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveTemplate(tpl.template);
                                                setIsCreateModalOpen(true);
                                            }}
                                            className="w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-200 active:scale-[0.98]"
                                        >
                                            <Plus size={14} strokeWidth={2.5} /> Use this template
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Custom goal link */}
                            <div className="text-center mt-6">
                                <button 
                                    onClick={() => {
                                        setActiveTemplate(null);
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="text-sm font-semibold text-muted-foreground hover:text-emerald-700 transition-colors cursor-pointer"
                                >
                                    or create a custom goal from scratch →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. REACHED GOALS — kept out of the active list so finished
                    work stops competing with what still needs attention, but
                    still visible: hitting a target is the point of the app. */}
                {reachedGoals.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <PartyPopper size={16} className="text-accent" />
                                Reached
                            </h3>
                            <span className="text-xs font-semibold text-muted-foreground">
                                {reachedGoals.length} {reachedGoals.length === 1 ? 'goal' : 'goals'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reachedGoals.map((goal) => {
                                const theme = resolveGoalTheme(goal.color_theme);

                                return (
                                    <Card key={goal.id} className="p-4 flex items-center gap-3 border-accent/30 bg-accent/5">
                                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0', theme.bg)}>
                                            {renderIcon(goal.icon_name, 'w-5 h-5')}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-foreground text-sm leading-tight truncate">
                                                {goal.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground tabular-nums">
                                                ₱{Number(goal.current_amount).toLocaleString('en-PH')} saved
                                            </p>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openViewModal(goal)}
                                            className="shrink-0"
                                        >
                                            View
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <CreateGoalModal 
                isOpen={isCreateModalOpen} 
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setActiveTemplate(null);
                }} 
                template={activeTemplate}
            />

            <AllocateFundsModal
                isOpen={allocatingGoal !== null}
                onClose={closeAllocateModal}
                goal={allocatingGoal}
                savingsPoolBalance={finances?.unallocated || 0}
            />

            <TransferToSavingsModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                mainBalance={finances?.main_balance || 0}
            />

            <WithdrawFromSavingsModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                savingsPoolBalance={finances?.unallocated || 0}
            />

            <DeallocateFundsModal
                isOpen={deallocatingGoal !== null}
                onClose={closeDeallocateModal}
                goal={deallocatingGoal}
            />

            <EditGoalModal
                isOpen={editingGoal !== null}
                onClose={closeEditModal}
                goal={editingGoal}
            />

            <DeleteGoalModal
                isOpen={deletingGoal !== null}
                onClose={closeDeleteModal}
                goal={deletingGoal}
            />

            <ViewDetailsModal
                isOpen={viewingGoalId !== null}
                onClose={closeViewModal}
                goalId={viewingGoalId}
                onAddFunds={(goal) => setAllocatingGoal(goal)}
                onUnallocate={(goal) => setDeallocatingGoal(goal)}
                onEdit={(goal) => setEditingGoal(goal)}
            />
        </UserLayout>
    );
}