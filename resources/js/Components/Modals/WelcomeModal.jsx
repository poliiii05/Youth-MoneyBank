// resources/js/Components/Modals/WelcomeModal.jsx
import { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, Sparkles, Target, 
    TrendingUp, ShieldCheck, Wallet, Flame,
} from 'lucide-react';

const SLIDES = [
    {
        icon: Sparkles,
        iconColor: 'from-blue-400 to-indigo-500',
        title: 'Welcome to Youth MoneyBank! 👋',
        subtitle: 'Your savings journey starts here',
        description: 'A safe digital banking app designed for Filipino youth — learn to save, set goals, and grow your money smartly.',
    },
    {
        icon: Target,
        iconColor: 'from-emerald-400 to-green-500',
        title: 'Set Savings Goals',
        subtitle: 'Save for what matters',
        description: 'Create goals like "New Phone" or "Emergency Fund" and track your progress. Allocate funds anytime from your Savings Pool.',
    },
    {
        icon: Flame,
        iconColor: 'from-amber-400 to-orange-500',
        title: 'Build Saving Streaks',
        subtitle: 'Consistency beats intensity',
        description: 'Save daily to build your streak. Unlock milestones at 7, 14, 30 days and beyond. Your progress is tracked sa Insights page.',
    },
    {
        icon: ShieldCheck,
        iconColor: 'from-purple-400 to-indigo-500',
        title: 'Tier-Based Limits',
        subtitle: 'Start at ₱5K, grow to ₱100K',
        description: 'Tier 1 starts with ₱5,000 balance limit. Upgrade to Tier 2 (₱20K) with Student ID, or Tier 3 (₱100K) with Government ID.',
    },
    {
        icon: Wallet,
        iconColor: 'from-blue-500 to-indigo-600',
        title: "You're All Set!",
        subtitle: 'Start saving today',
        description: 'Add money to your wallet, create your first savings goal, or explore the dashboard. Your financial future starts now!',
    },
];

export default function WelcomeModal({ isOpen, onClose }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    
    if (!isOpen) return null;
    
    const slide = SLIDES[currentSlide];
    const Icon = slide.icon;
    const isLast = currentSlide === SLIDES.length - 1;
    const isFirst = currentSlide === 0;
    
    const handleNext = () => {
        if (isLast) {
            handleComplete();
        } else {
            setCurrentSlide(currentSlide + 1);
        }
    };
    
    const handlePrev = () => {
        if (!isFirst) {
            setCurrentSlide(currentSlide - 1);
        }
    };
    
    const handleSkip = () => {
        handleComplete();
    };
    
    const handleComplete = async () => {
        setIsCompleting(true);
        try {
            await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
        } catch (err) {
            console.error('Onboarding completion failed:', err);
        } finally {
            setIsCompleting(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/70 backdrop-blur-md">
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 relative">
                
                {/* Close button (skip) */}
                <button
                    onClick={handleSkip}
                    disabled={isCompleting}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 backdrop-blur-sm hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer disabled:opacity-60"
                    title="Skip"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>

                {/* Slide content */}
                <div className="px-6 pt-10 pb-6 text-center">
                    {/* Icon with gradient bg */}
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${slide.iconColor} rounded-3xl flex items-center justify-center shadow-lg mb-5`}>
                        <Icon size={36} className="text-white" strokeWidth={2.5} />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">
                        {slide.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                        {slide.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                        {slide.description}
                    </p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 pb-4">
                    {SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentSlide 
                                    ? 'w-6 bg-blue-600' 
                                    : idx < currentSlide
                                    ? 'w-1.5 bg-blue-300'
                                    : 'w-1.5 bg-slate-200'
                            }`}
                        />
                    ))}
                </div>

                {/* Footer with navigation */}
                <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3 bg-slate-50/50">
                    {/* Skip / Prev */}
                    {isFirst ? (
                        <button
                            onClick={handleSkip}
                            disabled={isCompleting}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-60"
                        >
                            Skip tour
                        </button>
                    ) : (
                        <button
                            onClick={handlePrev}
                            disabled={isCompleting}
                            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-60"
                        >
                            <ChevronLeft size={14} strokeWidth={2.5} />
                            Back
                        </button>
                    )}

                    {/* Next / Get started */}
                    <button
                        onClick={handleNext}
                        disabled={isCompleting}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-200 cursor-pointer disabled:opacity-60"
                    >
                        {isCompleting ? (
                            <span>Saving...</span>
                        ) : isLast ? (
                            <>
                                <Sparkles size={12} strokeWidth={2.5} />
                                Get Started
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight size={14} strokeWidth={2.5} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}