// resources/js/Pages/Support/Create.jsx
import { Head, Link, router, useForm } from '@inertiajs/react';
import UserLayout from '../../Components/Layouts/UserLayout';
import { 
    ArrowLeft, Headphones, FileText, AlertCircle, Send,
} from 'lucide-react';

export default function SupportCreate({ auth, transaction = null }) {
    const user = auth?.user;

    const form = useForm({
        subject: '',
        category: transaction ? 'transaction' : 'general',
        priority: 'normal',
        message: '',
        transaction_id: transaction?.id || null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/support');
    };

    const charCount = form.data.message.length;
    const subjectCharCount = form.data.subject.length;

    return (
        <UserLayout user={user} header="New Support Ticket">
            <Head title="New Ticket | Support" />

            {/* Back link */}
            <Link
                href="/support"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4 cursor-pointer"
            >
                <ArrowLeft size={14} strokeWidth={2.5} />
                Back to Support
            </Link>

            <div className="max-w-3xl">
                {/* Header card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[1.5rem] p-5 mb-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Headphones size={22} className="text-white" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-base font-black mb-0.5">Submit a new ticket</h2>
                            <p className="text-[11px] text-blue-100 font-medium">
                                Our support team will respond within 24 hours
                            </p>
                        </div>
                    </div>
                </div>

                {/* Related transaction banner */}
                {transaction && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <FileText size={16} className="text-blue-700" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Related Transaction</p>
                                <p className="text-sm font-black text-blue-900 truncate">{transaction.title}</p>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                    <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                                        #{transaction.reference}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        transaction.is_positive 
                                            ? 'text-emerald-700 bg-white border-emerald-200' 
                                            : 'text-red-700 bg-white border-red-200'
                                    }`}>
                                        {transaction.is_positive ? '+' : '-'}₱{transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 capitalize">
                                        {transaction.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    {/* Subject */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Subject <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.data.subject}
                            onChange={(e) => form.setData('subject', e.target.value)}
                            disabled={form.processing}
                            maxLength={200}
                            placeholder="Brief description of your issue"
                            className={`w-full px-3 py-2.5 text-sm font-medium border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                                form.errors.subject ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'
                            }`}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {form.errors.subject ? (
                                <p className="text-[10px] font-bold text-red-600">{form.errors.subject}</p>
                            ) : (
                                <p className="text-[10px] text-slate-400 font-medium">Min 5 characters</p>
                            )}
                            <p className="text-[10px] font-medium text-slate-400">{subjectCharCount}/200</p>
                        </div>
                    </div>

                    {/* Category + Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                                Category <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={form.data.category}
                                onChange={(e) => form.setData('category', e.target.value)}
                                disabled={form.processing}
                                className="w-full px-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 cursor-pointer"
                            >
                                <option value="general">General Inquiry</option>
                                <option value="transaction">Transaction Issue</option>
                                <option value="kyc">KYC / Verification</option>
                                <option value="account">Account Access</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                                Priority <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={form.data.priority}
                                onChange={(e) => form.setData('priority', e.target.value)}
                                disabled={form.processing}
                                className="w-full px-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 cursor-pointer"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1.5 block">
                            Describe your issue <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={form.data.message}
                            onChange={(e) => form.setData('message', e.target.value)}
                            disabled={form.processing}
                            maxLength={5000}
                            rows={6}
                            placeholder="Please provide as much detail as possible. Include any error messages, dates, amounts, or steps you took."
                            className={`w-full px-3 py-2.5 text-sm font-medium border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                                form.errors.message ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'
                            }`}
                        />
                        <div className="flex items-center justify-between mt-1">
                            {form.errors.message ? (
                                <p className="text-[10px] font-bold text-red-600">{form.errors.message}</p>
                            ) : (
                                <p className={`text-[10px] font-bold ${
                                    charCount >= 20 ? 'text-emerald-600' : 'text-slate-400'
                                }`}>
                                    {charCount >= 20 ? '✓ Good detail' : `${20 - charCount} more characters needed`}
                                </p>
                            )}
                            <p className="text-[10px] font-medium text-slate-400">{charCount}/5000</p>
                        </div>
                    </div>

                    {/* Info banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle size={14} className="text-blue-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="text-[11px] text-blue-800 font-medium">
                            We typically respond within 24 hours during business hours. 
                            For urgent issues (suspected fraud, account locked), please mark as <span className="font-black">Urgent</span>.
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <Link
                            href="/support"
                            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing || form.data.subject.length < 5 || form.data.message.length < 20}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={13} strokeWidth={2.5} />
                            {form.processing ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </UserLayout>
    );
}