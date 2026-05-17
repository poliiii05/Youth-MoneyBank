// resources/js/Pages/User/Settings.jsx
import { Head } from '@inertiajs/react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { User, ShieldCheck, CreditCard, ChevronRight, Upload, AlertCircle } from 'lucide-react';

export default function Settings({ auth }) {
    const user = auth?.user;

    return (
        <UserLayout user={user} header="Account Settings">
            <Head title="Settings | Youth MoneyBank" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Account Tier & KYC (Pinaka-importante sa YMB) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* KYC / TIER UPGRADE CARD */}
                    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    Account Tier Status
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Your current limits and access levels</p>
                            </div>
                            <div className="px-4 py-1.5 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">
                                TIER 1: BASIC
                            </div>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6">
                            <ul className="space-y-2 text-sm text-gray-700 font-medium">
                                <li className="flex items-center justify-between">
                                    <span>Maximum Balance:</span>
                                    <span className="font-bold text-gray-900">₱3,000.00</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span>Cash-Out Ability:</span>
                                    <span className="font-bold text-orange-600 flex items-center gap-1">
                                        <AlertCircle size={14} /> Locked (Requires Guardian)
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="font-bold text-gray-900 mb-2">Upgrade to Tier 2 (Student)</h3>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                Increase your balance limit to ₱5,000 and unlock limited cash-out features. Requires parent/guardian consent and a valid Student ID.
                            </p>
                            <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md">
                                <Upload size={18} /> Upload Student ID
                            </button>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                <input type="text" disabled value={user?.name || "User"} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                <input type="text" disabled value={user?.phone_number || "+63 9XX XXX XXXX"} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                <input type="email" disabled value={user?.email || "Not provided"} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Navigation/Actions */}
                <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900 text-sm">Security & Password</p>
                                <p className="text-xs text-gray-500">Update your PIN and password</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                    </button>

                    <button className="w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <CreditCard size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-900 text-sm">Payment Methods</p>
                                <p className="text-xs text-gray-500">Manage linked accounts</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                    </button>
                </div>

            </div>
        </UserLayout>
    );
}