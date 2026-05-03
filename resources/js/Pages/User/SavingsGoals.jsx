// resources/js/Pages/User/SavingsGoals.jsx
import { Head } from '@inertiajs/react';
import UserLayout from '../../Layouts/UserLayout';
import { Plus, Smartphone, Zap, AlertTriangle, ChevronRight } from 'lucide-react';

export default function SavingsGoals({ auth }) {
    const user = auth?.user;

    // Dummy data base sa image reference mo
    const finances = {
        totalSavings: 6000.00,
        allocated: 4500.00,
        unallocated: 1500.00
    };

    const goals = [
        {
            id: 1,
            title: "Dream Phone",
            icon: <Smartphone className="text-blue-500" size={24} />,
            currentAmount: 3500,
            targetAmount: 10000,
            subtitle: "Saving Up for a New Smartphone",
            color: "bg-emerald-500" // Green progress
        },
        {
            id: 2,
            title: "New Sneakers",
            icon: <Zap className="text-indigo-500" size={24} />,
            currentAmount: 800,
            targetAmount: 2000,
            subtitle: "Almost Halfway There!",
            color: "bg-amber-500" // Yellow progress
        },
        {
            id: 3,
            title: "Emergency Fund",
            icon: <AlertTriangle className="text-red-500" size={24} />,
            currentAmount: 200,
            targetAmount: 3000,
            subtitle: "For Unexpected Expenses",
            color: "bg-red-500" // Red progress
        }
    ];

    return (
        <UserLayout user={user} header="Savings Goals">
            <Head title="Savings Goals | Youth MoneyBank" />

            {/* TOP SUMMARY BANNER (Base sa image) */}
            <div className="bg-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-blue-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full">
                    {/* Total Savings Big Text */}
                    <div>
                        <p className="text-blue-100 font-medium mb-1">Total Savings</p>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                            ₱{finances.totalSavings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </h2>
                    </div>

                    {/* Breakdown */}
                    <div className="flex flex-col justify-center space-y-1 mt-2 md:mt-0 border-l-0 md:border-l border-blue-400 md:pl-8">
                        <p className="text-sm font-medium">
                            <span className="text-blue-200">Allocated to Goals:</span> ₱{finances.allocated.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm font-medium">
                            <span className="text-blue-200">Unallocated Balance:</span> ₱{finances.unallocated.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Add Goal Button */}
                <button className="whitespace-nowrap px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center">
                    Add Goal <Plus size={20} />
                </button>
            </div>

            {/* MY GOALS LIST */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">My Goals</h3>
                
                <div className="flex flex-col gap-4">
                    {goals.map((goal) => {
                        // Compute progress percentage
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        
                        return (
                            <div key={goal.id} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors group">
                                
                                {/* Top Row: Icon & Title */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            {goal.icon}
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg">{goal.title}</h4>
                                    </div>
                                    
                                    {/* Desktop Add Savings Button */}
                                    <button className="hidden md:flex px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all items-center gap-1 cursor-pointer border border-blue-100">
                                        Add Savings
                                    </button>
                                </div>

                                {/* Middle Row: Amounts */}
                                <div className="flex items-end gap-2 mb-3">
                                    <span className="font-bold text-gray-900">
                                        ₱{goal.currentAmount.toLocaleString()}
                                    </span>
                                    <span className="text-gray-400 font-medium text-sm mb-0.5">
                                        / ₱{goal.targetAmount.toLocaleString()}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${goal.color}`} 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                {/* Bottom Row: Subtitle & Mobile Button */}
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-sm text-gray-500 font-medium">
                                        {goal.subtitle}
                                    </p>
                                    
                                    {/* Mobile Add Savings Button (Icon Only) */}
                                    <button className="md:hidden p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                                        <Plus size={18} />
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

        </UserLayout>
    );
}