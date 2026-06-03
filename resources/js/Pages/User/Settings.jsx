// resources/js/Pages/User/Settings.jsx
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { User, Sparkles } from 'lucide-react';
import ProfileTab from './Settings/ProfileTab';
import TierUpgradeTab from './Settings/TierUpgradeTab';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'upgrade', label: 'Tier Upgrade', icon: Sparkles },
];

export default function Settings({ auth, profile, active_tab }) {
    const user = auth?.user;
    const [activeTab, setActiveTab] = useState(active_tab || 'profile');

    useEffect(() => {
        if (active_tab) setActiveTab(active_tab);
    }, [active_tab]);

    const switchTab = (tabId) => {
        setActiveTab(tabId);
        const url = new URL(window.location);
        if (tabId === 'profile') {
            url.searchParams.delete('tab');
        } else {
            url.searchParams.set('tab', tabId);
        }
        window.history.replaceState({}, '', url);
    };

    return (
        <UserLayout user={user} header="Settings">
            <Head title="Settings | Youth MoneyBank" />

            <div className="max-w-4xl mx-auto">
                {/* TABS NAVIGATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-300 overflow-hidden mb-6">
                    <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-200">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => switchTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                                        isActive
                                            ? 'text-blue-700 border-blue-600 bg-blue-50/30'
                                            : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* TAB CONTENT */}
                    <div className="p-5 sm:p-6">
                        {activeTab === 'profile' && <ProfileTab profile={profile} />}
                        {activeTab === 'upgrade' && <TierUpgradeTab profile={profile} />}
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}