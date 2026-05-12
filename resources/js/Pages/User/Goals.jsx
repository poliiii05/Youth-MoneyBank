// resources/js/Pages/User/Goals.jsx
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '../../Layouts/UserLayout';
import CreateGoalModal from '../../Components/Modals/CreateGoalModal'; // <-- IMPORT NATIN YUNG MODAL
import { Target, Plus, ShieldAlert, Smartphone, ShoppingBag, MoreVertical, Edit2, Trash2, PiggyBank, Landmark, Umbrella, GraduationCap, Gamepad2, Plane } from 'lucide-react';

export default function Goals({ auth, finances, goals }) {
    const user = auth?.user;
    const [activeMenu, setActiveMenu] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // <-- STATE PARA SA MODAL

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
                {/* 1. TOTAL SAVINGS HEADER & ADD GOAL BUTTON (Yung paborito mong design!) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    
                    {/* Upper Row: Total Amount & Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Savings</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                                ₱{(finances?.total_savings || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                        
                        <button 
                            onClick={() => setIsCreateModalOpen(true)} // <-- TATAWAGIN NA NITO YUNG MODAL
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 cursor-pointer transition-all flex items-center gap-2"
                        >
                            <Plus size={20} strokeWidth={2.5} /> Add New Goal
                        </button>
                    </div>
                    
                    {/* Lower Row: Breakdown */}
                    <div className="flex flex-col sm:flex-row gap-6 pt-5 border-t border-gray-100">
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

                                return (
                                    <div key={goal.id} className="h-[220px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between relative group hover:border-blue-200 transition-colors">
                                        
                                        <div className="flex justify-between items-start relative">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${goal.color_theme}`}>
                                                    {renderIcon(goal.icon_name, "w-6 h-6")}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 leading-tight truncate max-w-[150px]">{goal.title}</h3>
                                                    <p className="text-[11px] text-gray-500 font-medium truncate max-w-[150px]">{goal.subtitle}</p>
                                                </div>
                                            </div>

                                            {/* 3-DOT ACTION MENU */}
                                            <div className="relative">
                                                <button 
                                                    onClick={() => toggleMenu(goal.id)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeMenu === goal.id && (
                                                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 overflow-hidden">
                                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-slate-50 transition-colors cursor-pointer">
                                                            <Edit2 size={14} /> Edit Goal
                                                        </button>
                                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

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
                                    </div>
                                );
                            })}

                        </div>
                    ) : (
                        /* EMPTY STATE (Kung wala pang goals) */
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center mt-6">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                <Target size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No active goals</h3>
                            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 font-medium">
                                Start saving for your dream items today!
                            </p>
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                            >
                                Create your first goal <Plus size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* TATAWAGIN DITO YUNG MODAL */}
            <CreateGoalModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />
        </UserLayout>
    );
}