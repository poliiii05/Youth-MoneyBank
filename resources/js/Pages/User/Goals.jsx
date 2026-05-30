// resources/js/Pages/User/Goals.jsx
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';   // ← add useEffect
import UserLayout from '../../Components/Layouts/UserLayout';
import CreateGoalModal from '../../Components/Modals/CreateGoalModal';
import AllocateFundsModal from '../../Components/Modals/AllocateFundsModal';
import TransferToSavingsModal from '../../Components/Modals/TransferToSavingsModal';
import WithdrawFromSavingsModal from '../../Components/Modals/WithdrawFromSavingsModal';
import DeallocateFundsModal from '../../Components/Modals/DeallocateFundsModal';
import EditGoalModal from '../../Components/Modals/EditGoalModal';
import DeleteGoalModal from '../../Components/Modals/DeleteGoalModal';
import ViewDetailsModal from '../../Components/Modals/ViewDetailsModal';   // ← ADD THIS
import { Target, Plus, ShieldAlert, Smartphone, ShoppingBag, MoreVertical, Edit2, Trash2, PlusCircle, PiggyBank, Wallet, ArrowUpRight, ArrowDownLeft, Landmark, Umbrella, GraduationCap, Gamepad2, Plane } from 'lucide-react';export default function Goals({ auth, finances, goals }) {
    const user = auth?.user;
    const [activeMenu, setActiveMenu] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // <-- STATE PARA SA MODAL
    const [allocatingGoal, setAllocatingGoal] = useState(null);  // ← BAGO
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false); // dagdag din
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

        const openAllocateModal = (goal) => {
            setActiveMenu(null);  // Close the dropdown
            setAllocatingGoal(goal);
        };

        const closeAllocateModal = () => {
            setAllocatingGoal(null);
        };

        const [deallocatingGoal, setDeallocatingGoal] = useState(null);

        const openDeallocateModal = (goal) => {
            setActiveMenu(null);
            setDeallocatingGoal(goal);
        };

        const closeDeallocateModal = () => {
            setDeallocatingGoal(null);
        };

        const [editingGoal, setEditingGoal] = useState(null);

        const openEditModal = (goal) => {
            setActiveMenu(null);
            setEditingGoal(goal);
        };

        const closeEditModal = () => {
            setEditingGoal(null);
        };

        // Template state from Dashboard quick-start buttons
        const [activeTemplate, setActiveTemplate] = useState(null);

        // Handle ?template=Emergency URL param
        useEffect(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const template = urlParams.get('template');
            
            if (template) {
                setActiveTemplate(template);
                setIsCreateModalOpen(true);
                
                // Clean URL para hindi makita yung ?template=...
                window.history.replaceState({}, '', '/goals');
            }
        }, []);

        const openDeleteModal = (goal) => {
            setActiveMenu(null);
            setDeletingGoal(goal);
        };

        const closeDeleteModal = () => {
            setDeletingGoal(null);
        };

         const [deletingGoal, setDeletingGoal] = useState(null);

         const [viewingGoalId, setViewingGoalId] = useState(null);

        const openViewModal = (goal) => {
            setActiveMenu(null);
            setViewingGoalId(goal.id);
        };

        const closeViewModal = () => {
            setViewingGoalId(null);
        };

    // Pinagsama natin yung mga dati mong icons at yung mga bagong icons!
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

    const toggleMenu = (goalId) => {
        setActiveMenu(activeMenu === goalId ? null : goalId);
    };

    return (
        <UserLayout user={user} header="Savings Module">
            <Head title="Savings Goals | Youth MoneyBank" />

            <div className="max-w-6xl mx-auto">
                {/* 1. SAVINGS OVERVIEW with Add/Withdraw actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    
                    {/* Top Row: Total Savings + Add Goal Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Savings</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                                ₱{(finances?.total_savings || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                        
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer transition-all flex items-center gap-2"
                        >
                            <Plus size={20} strokeWidth={2.5} /> Add New Goal
                        </button>
                    </div>

                        {/* Middle Row: Breakdown */}
                        <div className="flex flex-col sm:flex-row gap-6 pt-5 border-t border-gray-100 mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                                <p className="text-sm text-gray-600 font-medium">
                                    Allocated to Goals: <span className="font-bold text-gray-900">₱{(finances?.allocated || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                                <p className="text-sm text-gray-600 font-medium">
                                    Unallocated Savings: <span className="font-bold text-gray-900">₱{(finances?.unallocated || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                                </p>
                            </div>
                        </div>

                        {/* Bottom Row: Savings Pool Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-gray-100">
                            <button
                                onClick={() => setIsTransferModalOpen(true)}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-colors cursor-pointer border border-emerald-100"
                            >
                                <ArrowDownLeft size={16} strokeWidth={2.5} /> Add to Savings
                            </button>
                            <button
                                onClick={() => setIsWithdrawModalOpen(true)}
                                disabled={(finances?.unallocated || 0) <= 0}
                                className={`flex items-center justify-center gap-2 py-3 px-4 font-bold rounded-xl transition-colors border ${
                                    (finances?.unallocated || 0) > 0
                                        ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100 cursor-pointer'
                                        : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                }`}
                            >
                                <ArrowUpRight size={16} strokeWidth={2.5} /> Withdraw to Wallet
                            </button>
                        </div>
                    </div>

                {/* 2. GOAL CARDS GRID */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Your Active Goals</h3>
                    </div>
                    
                    {goals && goals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {/* DYNAMIC GOAL CARDS FROM DATABASE */}
                           {goals.map((goal) => {
                                const percentage = goal.target_amount > 0 
                                    ? (goal.current_amount / goal.target_amount) * 100 
                                    : 0;
                                const isGoalFull = goal.current_amount >= goal.target_amount;

                                return (
                                    <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 relative group hover:border-blue-200 transition-colors">
                                        
                                        {/* HEADER: Icon + Title + 3-dot menu */}
                                        <div className="flex justify-between items-start relative">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${goal.color_theme}`}>
                                                    {renderIcon(goal.icon_name, "w-6 h-6")}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 leading-tight truncate max-w-[150px]">{goal.title}</h3>
                                                    <p className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]">{goal.subtitle}</p>
                                                </div>
                                            </div>

                                            {/* 3-DOT ACTION MENU (Edit + Delete only now) */}
                                            <div className="relative">
                                                <button 
                                                    onClick={() => toggleMenu(goal.id)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeMenu === goal.id && (
                                                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 overflow-hidden">
                                                        <button 
                                                            onClick={() => openDeallocateModal(goal)}
                                                            disabled={goal.current_amount <= 0}
                                                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors ${
                                                                goal.current_amount > 0
                                                                    ? 'text-blue-700 hover:bg-blue-50 cursor-pointer'
                                                                    : 'text-slate-300 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <ArrowUpRight size={14} /> Unallocate Funds
                                                        </button>
                                                        <button 
                                                            onClick={() => openEditModal(goal)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                                        >
                                                            <Edit2 size={14} /> Edit Goal
                                                        </button>

                                                        <button 
                                                            onClick={() => openDeleteModal(goal)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* PROGRESS SECTION */}
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Saved</p>
                                                    <p className="text-xl font-black text-gray-900 tracking-tight">
                                                        ₱{Number(goal.current_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <p className="text-xs font-bold text-gray-500">
                                                    / ₱{Number(goal.target_amount).toLocaleString('en-PH')}
                                                </p>
                                            </div>

                                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className={`h-2.5 rounded-full ${goal.color_theme} transition-all duration-1000 ease-out`} 
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-500 mt-2 text-right">
                                                {percentage.toFixed(1)}% Completed
                                            </p>
                                        </div>

                                        {/* ACTION BUTTONS */}
                                        <div className="flex gap-2 mt-auto">
                                            <button
                                                onClick={() => openAllocateModal(goal)}
                                                disabled={isGoalFull}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                                    isGoalFull
                                                        ? 'bg-emerald-50 text-emerald-600 cursor-not-allowed'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200/50'
                                                }`}
                                            >
                                                {isGoalFull ? (
                                                    <>🎉 Goal Reached!</>
                                                ) : (
                                                    <>
                                                        <PlusCircle size={14} strokeWidth={2.5} /> Add Funds
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => openViewModal(goal)}
                                                className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                   ) : (
                            <div>
                                {/* Subtle hint header */}
                                <p className="text-xs text-slate-500 font-medium mb-4 text-center">
                                    Pick a template to get started, or create a custom goal →
                                </p>

                                {/* Template cards — matches Active Goals grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { 
                                            template: 'Emergency', 
                                            title: 'Emergency Fund', 
                                            subtitle: 'For unexpected expenses',
                                            target: 5000,
                                            icon: 'ShieldAlert',
                                            color: 'bg-red-500',
                                            emoji: '🚨'
                                        },
                                        { 
                                            template: 'Phone', 
                                            title: 'New Phone', 
                                            subtitle: 'Saving for an upgrade',
                                            target: 15000,
                                            icon: 'Smartphone',
                                            color: 'bg-blue-500',
                                            emoji: '📱'
                                        },
                                        { 
                                            template: 'Travel', 
                                            title: 'Travel Fund', 
                                            subtitle: 'Adventure awaits',
                                            target: 10000,
                                            icon: 'Plane',
                                            color: 'bg-purple-500',
                                            emoji: '✈️'
                                        },
                                    ].map((tpl) => (
                                        <div 
                                            key={tpl.template}
                                            className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200 p-5 flex flex-col gap-4 hover:border-blue-300 hover:bg-blue-50/20 transition-all group cursor-pointer"
                                            onClick={() => {
                                                setActiveTemplate(tpl.template);
                                                setIsCreateModalOpen(true);
                                            }}
                                        >
                                            {/* HEADER: matches goal card */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${tpl.color}`}>
                                                        {renderIcon(tpl.icon, "w-6 h-6")}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-slate-900 leading-tight truncate max-w-[150px]">{tpl.title}</h3>
                                                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">{tpl.subtitle}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-slate-100 text-slate-500 shrink-0">
                                                    Template
                                                </span>
                                            </div>

                                            {/* PROGRESS placeholder */}
                                            <div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Saved</p>
                                                        <p className="text-xl font-black text-slate-400 tracking-tight">₱0.00</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-500">
                                                        / ₱{tpl.target.toLocaleString('en-PH')}
                                                    </p>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                    <div className="h-2.5 rounded-full bg-slate-200" style={{ width: '2%' }}></div>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2 text-right">
                                                    Not started
                                                </p>
                                            </div>

                                            {/* CTA button — matches goal card pattern */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveTemplate(tpl.template);
                                                    setIsCreateModalOpen(true);
                                                }}
                                                className="w-full py-2.5 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
                className="text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors cursor-pointer"
            >
                or create a custom goal from scratch →
            </button>
        </div>
                            </div>
)}

                </div>
            </div>

            {/* TATAWAGIN DITO YUNG MODAL */}
           <CreateGoalModal 
                isOpen={isCreateModalOpen} 
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setActiveTemplate(null);  // Clear template when closing
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