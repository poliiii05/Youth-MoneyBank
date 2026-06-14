<?php

namespace App\Data;

class HelpArticles
{
    public static function categories(): array
    {
        return [
            [
                'slug' => 'deposit',
                'name' => 'Deposit',
                'description' => 'Adding money to your wallet',
                'color' => 'blue',
            ],
            [
                'slug' => 'savings',
                'name' => 'Savings & Goals',
                'description' => 'Saving money and tracking goals',
                'color' => 'emerald',
            ],
            [
                'slug' => 'account',
                'name' => 'Account & KYC',
                'description' => 'Verification and account settings',
                'color' => 'purple',
            ],
            [
                'slug' => 'security',
                'name' => 'Security & Privacy',
                'description' => 'Account safety and protection',
                'color' => 'amber',
            ],
            [
                'slug' => 'about',
                'name' => 'About Youth MoneyBank',
                'description' => 'How YMB works',
                'color' => 'slate',
            ],
        ];
    }

   public static function articles(): array
{
    return [
        'deposit' => [
            ['slug' => 'how-to-add-money', 'title' => 'How do I add money to my wallet?', 'summary' => 'Step-by-step guide on depositing funds', 'content' => self::howToAddMoney(), 'related' => ['deposit-not-reflected', 'deposit-limits', 'minimum-deposit', 'deposit-methods', 'deposit-fees']],
            ['slug' => 'deposit-not-reflected', 'title' => 'My deposit is not reflecting in my wallet', 'summary' => 'What to do when your deposit takes too long', 'content' => self::depositNotReflected(), 'related' => ['how-to-add-money', 'failed-deposit', 'deposit-methods', 'deposit-limits', 'deposit-fees']],
            ['slug' => 'deposit-limits', 'title' => 'What are my deposit limits?', 'summary' => 'Understanding tier-based wallet limits', 'content' => self::depositLimits(), 'related' => ['kyc-upgrade', 'how-to-add-money', 'what-is-kyc', 'minimum-deposit', 'kyc-documents']],
            ['slug' => 'minimum-deposit', 'title' => 'Is there a minimum deposit amount?', 'summary' => 'Smallest amount you can add', 'content' => self::minimumDeposit(), 'related' => ['how-to-add-money', 'deposit-limits', 'deposit-fees', 'deposit-methods', 'savings-tips']],
            ['slug' => 'failed-deposit', 'title' => 'My deposit failed but money was deducted', 'summary' => 'What to do with failed transactions', 'content' => self::failedDeposit(), 'related' => ['deposit-not-reflected', 'how-to-add-money', 'deposit-methods', 'suspicious-activity', 'contact-information']],
            ['slug' => 'deposit-methods', 'title' => 'What payment methods can I use?', 'summary' => 'Available deposit options', 'content' => self::depositMethods(), 'related' => ['how-to-add-money', 'deposit-fees', 'minimum-deposit', 'deposit-limits', 'failed-deposit']],
            ['slug' => 'deposit-fees', 'title' => 'Are there fees for depositing?', 'summary' => 'Cost of adding money to your wallet', 'content' => self::depositFees(), 'related' => ['deposit-methods', 'how-to-add-money', 'fees-overview', 'minimum-deposit', 'deposit-limits']],
        ],
        'savings' => [
            ['slug' => 'how-to-set-goal', 'title' => 'How do I set a savings goal?', 'summary' => 'Creating and managing your savings goals', 'content' => self::howToSetGoal(), 'related' => ['savings-vs-wallet', 'goal-not-progressing', 'allocate-funds', 'savings-tips', 'delete-goal']],
            ['slug' => 'savings-vs-wallet', 'title' => 'What\'s the difference between Wallet and Savings?', 'summary' => 'Understanding the two balance types', 'content' => self::savingsVsWallet(), 'related' => ['how-to-set-goal', 'allocate-funds', 'deallocate-funds', 'savings-tips', 'goal-not-progressing']],
            ['slug' => 'goal-not-progressing', 'title' => 'My goal is not progressing', 'summary' => 'How to allocate funds to your goals', 'content' => self::goalNotProgressing(), 'related' => ['allocate-funds', 'how-to-set-goal', 'savings-vs-wallet', 'deallocate-funds', 'savings-tips']],
            ['slug' => 'allocate-funds', 'title' => 'How do I allocate funds to a goal?', 'summary' => 'Moving money into your goals', 'content' => self::allocateFunds(), 'related' => ['how-to-set-goal', 'deallocate-funds', 'savings-vs-wallet', 'goal-not-progressing', 'savings-tips']],
            ['slug' => 'deallocate-funds', 'title' => 'Can I remove money from a goal?', 'summary' => 'Withdrawing from your goals', 'content' => self::deallocateFunds(), 'related' => ['allocate-funds', 'savings-vs-wallet', 'how-to-set-goal', 'delete-goal', 'savings-tips']],
            ['slug' => 'delete-goal', 'title' => 'How do I delete a savings goal?', 'summary' => 'Removing goals you no longer need', 'content' => self::deleteGoal(), 'related' => ['how-to-set-goal', 'deallocate-funds', 'allocate-funds', 'savings-vs-wallet', 'savings-tips']],
            ['slug' => 'savings-tips', 'title' => 'Tips for saving money effectively', 'summary' => 'Best practices for young savers', 'content' => self::savingsTips(), 'related' => ['how-to-set-goal', 'savings-vs-wallet', 'allocate-funds', 'minimum-deposit', 'goal-not-progressing']],
        ],
        'account' => [
            ['slug' => 'what-is-kyc', 'title' => 'What is KYC and why do I need it?', 'summary' => 'Understanding identity verification', 'content' => self::whatIsKyc(), 'related' => ['kyc-upgrade', 'kyc-rejected', 'kyc-documents', 'deposit-limits', 'update-profile']],
            ['slug' => 'kyc-upgrade', 'title' => 'How do I upgrade my tier?', 'summary' => 'Step-by-step tier upgrade process', 'content' => self::kycUpgrade(), 'related' => ['what-is-kyc', 'deposit-limits', 'kyc-documents', 'kyc-rejected', 'update-profile']],
            ['slug' => 'kyc-rejected', 'title' => 'My KYC application was rejected', 'summary' => 'What to do after a rejected application', 'content' => self::kycRejected(), 'related' => ['kyc-upgrade', 'what-is-kyc', 'kyc-documents', 'update-profile', 'contact-information']],
            ['slug' => 'kyc-documents', 'title' => 'What documents do I need for KYC?', 'summary' => 'Acceptable identification documents', 'content' => self::kycDocuments(), 'related' => ['kyc-upgrade', 'what-is-kyc', 'kyc-rejected', 'update-profile', 'is-ymb-safe']],
            ['slug' => 'update-profile', 'title' => 'How do I update my profile information?', 'summary' => 'Changing your account details', 'content' => self::updateProfile(), 'related' => ['what-is-kyc', 'change-email', 'kyc-upgrade', 'how-to-login', 'delete-account']],
            ['slug' => 'change-email', 'title' => 'Can I change my email address?', 'summary' => 'Email management for OAuth users', 'content' => self::changeEmail(), 'related' => ['update-profile', 'how-to-login', 'account-locked', 'is-ymb-safe', 'delete-account']],
            ['slug' => 'delete-account', 'title' => 'How do I delete my account?', 'summary' => 'Closing your YMB account', 'content' => self::deleteAccount(), 'related' => ['update-profile', 'change-email', 'account-locked', 'privacy-policy', 'contact-information']],
        ],
        'security' => [
            ['slug' => 'how-to-login', 'title' => 'How do I log in?', 'summary' => 'Sign in with Google', 'content' => self::howToLogin(), 'related' => ['account-locked', 'is-ymb-safe', 'session-timeout', 'phishing-scams', 'change-email']],
            ['slug' => 'account-locked', 'title' => 'My account is locked or suspended', 'summary' => 'What to do if you can\'t access your account', 'content' => self::accountLocked(), 'related' => ['how-to-login', 'suspicious-activity', 'is-ymb-safe', 'phishing-scams', 'contact-information']],
            ['slug' => 'is-ymb-safe', 'title' => 'Is Youth MoneyBank safe?', 'summary' => 'Our security practices', 'content' => self::isYmbSafe(), 'related' => ['suspicious-activity', 'privacy-policy', 'phishing-scams', 'session-timeout', 'is-ymb-a-bank']],
            ['slug' => 'suspicious-activity', 'title' => 'I noticed suspicious activity on my account', 'summary' => 'Reporting unauthorized access', 'content' => self::suspiciousActivity(), 'related' => ['account-locked', 'is-ymb-safe', 'phishing-scams', 'session-timeout', 'contact-information']],
            ['slug' => 'phishing-scams', 'title' => 'How to spot phishing scams', 'summary' => 'Protect yourself from fraud', 'content' => self::phishingScams(), 'related' => ['is-ymb-safe', 'suspicious-activity', 'account-locked', 'privacy-policy', 'how-to-login']],
            ['slug' => 'privacy-policy', 'title' => 'How is my data protected?', 'summary' => 'Our privacy practices', 'content' => self::privacyPolicy(), 'related' => ['is-ymb-safe', 'phishing-scams', 'delete-account', 'session-timeout', 'suspicious-activity']],
            ['slug' => 'session-timeout', 'title' => 'Why was I logged out automatically?', 'summary' => 'Session security explained', 'content' => self::sessionTimeout(), 'related' => ['how-to-login', 'is-ymb-safe', 'account-locked', 'privacy-policy', 'phishing-scams']],
        ],
        'about' => [
            ['slug' => 'what-is-ymb', 'title' => 'What is Youth MoneyBank?', 'summary' => 'Introduction to YMB', 'content' => self::whatIsYmb(), 'related' => ['who-can-use', 'ymb-features', 'fees-overview', 'is-ymb-a-bank', 'is-ymb-safe']],
            ['slug' => 'who-can-use', 'title' => 'Who can use Youth MoneyBank?', 'summary' => 'Eligibility and target users', 'content' => self::whoCanUse(), 'related' => ['what-is-ymb', 'ymb-features', 'what-is-kyc', 'fees-overview', 'contact-information']],
            ['slug' => 'ymb-features', 'title' => 'What features does YMB offer?', 'summary' => 'Complete list of features', 'content' => self::ymbFeatures(), 'related' => ['what-is-ymb', 'who-can-use', 'how-to-set-goal', 'how-to-add-money', 'is-ymb-safe']],
            ['slug' => 'fees-overview', 'title' => 'What fees does YMB charge?', 'summary' => 'Pricing transparency', 'content' => self::feesOverview(), 'related' => ['deposit-fees', 'deposit-methods', 'what-is-ymb', 'is-ymb-a-bank', 'minimum-deposit']],
            ['slug' => 'is-ymb-a-bank', 'title' => 'Is YMB a real bank?', 'summary' => 'Understanding what YMB is', 'content' => self::isYmbABank(), 'related' => ['what-is-ymb', 'is-ymb-safe', 'fees-overview', 'privacy-policy', 'who-can-use']],
            ['slug' => 'contact-information', 'title' => 'How do I contact Youth MoneyBank?', 'summary' => 'Ways to reach our team', 'content' => self::contactInformation(), 'related' => ['what-is-ymb', 'is-ymb-safe', 'suspicious-activity', 'account-locked', 'delete-account']],
        ],
    ];
}

    public static function getArticle(string $categorySlug, string $articleSlug): ?array
    {
        $all = self::articles();
        if (!isset($all[$categorySlug])) return null;
        foreach ($all[$categorySlug] as $article) {
            if ($article['slug'] === $articleSlug) {
                return [...$article, 'category_slug' => $categorySlug];
            }
        }
        return null;
    }

    public static function getRelated(array $slugs, string $excludeSlug = ''): array
    {
        $all = self::articles();
        $related = [];
        foreach ($all as $catSlug => $articles) {
            foreach ($articles as $article) {
                if (in_array($article['slug'], $slugs) && $article['slug'] !== $excludeSlug) {
                    $related[] = [
                        'slug' => $article['slug'],
                        'title' => $article['title'],
                        'summary' => $article['summary'],
                        'category_slug' => $catSlug,
                    ];
                }
            }
        }
        return $related;
    }

    public static function getCategory(string $slug): ?array
    {
        foreach (self::categories() as $cat) {
            if ($cat['slug'] === $slug) return $cat;
        }
        return null;
    }

    // ===== DEPOSIT articles =====
    private static function howToAddMoney(): array { return [
        ['type' => 'paragraph', 'text' => 'Adding money to your Youth MoneyBank wallet is quick and easy. Follow these steps to deposit funds.'],
        ['type' => 'heading', 'text' => 'Step-by-step guide'],
        ['type' => 'list', 'items' => ['Log in to your YMB account', 'On the Dashboard, click the "Add Money" button', 'Choose your preferred deposit method', 'Enter the amount (minimum ₱50)', 'Confirm the transaction', 'Wait for confirmation']],
        ['type' => 'heading', 'text' => 'Processing time'],
        ['type' => 'paragraph', 'text' => 'Deposits are typically reflected within 5-10 minutes. During off-peak hours, this may take up to 1 hour.'],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'For first-time deposits, please ensure your account is verified to avoid delays.'],
    ]; }

    private static function depositNotReflected(): array { return [
        ['type' => 'paragraph', 'text' => 'If your deposit hasn\'t appeared in your wallet, don\'t worry. Here\'s what to check before contacting support.'],
        ['type' => 'heading', 'text' => 'Common causes'],
        ['type' => 'list', 'items' => ['Processing delay (most common — usually resolves within 1 hour)', 'Incorrect reference number used during bank transfer', 'Daily deposit limit reached for your tier', 'Account verification pending']],
        ['type' => 'heading', 'text' => 'What to do'],
        ['type' => 'list', 'items' => ['Wait at least 30 minutes after initiating the deposit', 'Check your Transactions page to see if it\'s pending', 'Verify you used the correct reference number', 'Take a screenshot of your payment confirmation']],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'Never share your reference number or payment screenshots with anyone except official YMB Support.'],
    ]; }

    private static function depositLimits(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank uses a tiered limit system based on your KYC verification level.'],
        ['type' => 'heading', 'text' => 'Tier-based limits'],
        ['type' => 'list', 'items' => ['Tier 1 (Starter): ₱5,000 maximum wallet balance — default for new users', 'Tier 2 (Builder): ₱20,000 maximum wallet balance — basic verification required', 'Tier 3 (Achiever): ₱100,000 maximum wallet balance — full verification required']],
        ['type' => 'heading', 'text' => 'Upgrading your tier'],
        ['type' => 'paragraph', 'text' => 'To increase your limits, submit a KYC upgrade application from your Account settings.'],
    ]; }

    private static function minimumDeposit(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank has a small minimum deposit to make banking accessible for young users.'],
        ['type' => 'heading', 'text' => 'Minimum amounts'],
        ['type' => 'list', 'items' => ['Minimum single deposit: ₱50', 'No minimum balance to keep your account active', 'Maximum balance depends on your KYC tier']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'Even ₱50 is a great start! Small consistent deposits add up over time.'],
    ]; }

    private static function failedDeposit(): array { return [
        ['type' => 'paragraph', 'text' => 'If your deposit failed but the money was deducted from your source account, don\'t panic. This usually resolves automatically.'],
        ['type' => 'heading', 'text' => 'What typically happens'],
        ['type' => 'list', 'items' => ['Failed deposits are auto-refunded within 24-48 hours to your source account', 'The refund will appear in your original payment method', 'You can check the status in your Transactions page']],
        ['type' => 'heading', 'text' => 'When to contact support'],
        ['type' => 'paragraph', 'text' => 'If the refund hasn\'t appeared after 48 hours, please contact us with your reference number and proof of deduction.'],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'Keep all transaction screenshots until the issue is resolved.'],
    ]; }

    private static function depositMethods(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank supports multiple convenient deposit methods.'],
        ['type' => 'heading', 'text' => 'Available methods'],
        ['type' => 'list', 'items' => ['GCash — instant transfer, 24/7 available', 'PayPal — for international users', 'Bank transfer (coming soon)', 'Convenience store payments (coming soon)']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'GCash is the fastest method — deposits usually reflect within 5 minutes.'],
    ]; }

    private static function depositFees(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank believes in transparent pricing for our young users.'],
        ['type' => 'heading', 'text' => 'Fee structure'],
        ['type' => 'list', 'items' => ['GCash deposits: FREE', 'PayPal deposits: 3.5% convenience fee (charged by PayPal)', 'Bank transfers: FREE (sender\'s bank may charge fees)', 'YMB does not charge any internal deposit fees']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'We never add hidden charges. The amount you deposit is what reaches your wallet (minus only third-party fees).'],
    ]; }

    // ===== SAVINGS articles =====
    private static function howToSetGoal(): array { return [
        ['type' => 'paragraph', 'text' => 'Savings goals help you save for specific things like gadgets, school supplies, or emergencies.'],
        ['type' => 'heading', 'text' => 'Creating a goal'],
        ['type' => 'list', 'items' => ['Go to the Goals page from the sidebar', 'Click "Create New Goal"', 'Enter a name (e.g., "New Phone")', 'Set a target amount', 'Choose an icon (optional)', 'Click "Save"']],
        ['type' => 'heading', 'text' => 'After creation'],
        ['type' => 'paragraph', 'text' => 'You need to allocate money from your Savings pool. Click on the goal, then use "Add to Goal" to transfer funds.'],
    ]; }

    private static function savingsVsWallet(): array { return [
        ['type' => 'paragraph', 'text' => 'Your YMB account has two balance types, each with a different purpose.'],
        ['type' => 'heading', 'text' => 'Main Wallet'],
        ['type' => 'paragraph', 'text' => 'Your spending money. Use this for transactions, transfers, and daily expenses. Money in your wallet is immediately available.'],
        ['type' => 'heading', 'text' => 'Savings Pool'],
        ['type' => 'paragraph', 'text' => 'Money set aside for goals. You can transfer money from your wallet to savings, then allocate it to specific goals. Helps you avoid spending money meant for saving.'],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'Total wallet limit includes both your Main Wallet and Savings Pool combined.'],
    ]; }

    private static function goalNotProgressing(): array { return [
        ['type' => 'paragraph', 'text' => 'If your goal\'s progress isn\'t moving, it usually means you haven\'t allocated funds to it yet.'],
        ['type' => 'heading', 'text' => 'How to allocate funds'],
        ['type' => 'list', 'items' => ['First, move money from your Wallet to your Savings Pool using the "Save" button', 'Then click on your goal to open its details', 'Click "Add to Goal" and enter the amount to allocate', 'The progress bar will update immediately']],
    ]; }

    private static function allocateFunds(): array { return [
        ['type' => 'paragraph', 'text' => 'Allocating funds means moving money from your Savings Pool into a specific goal.'],
        ['type' => 'heading', 'text' => 'Step-by-step'],
        ['type' => 'list', 'items' => ['Ensure you have money in your Savings Pool (transfer from wallet first)', 'Go to Goals page', 'Click on the goal you want to fund', 'Click "Add to Goal"', 'Enter the amount and confirm']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'You can only allocate from your Savings Pool, not directly from your wallet.'],
    ]; }

    private static function deallocateFunds(): array { return [
        ['type' => 'paragraph', 'text' => 'Yes, you can move money back from a goal to your Savings Pool anytime.'],
        ['type' => 'heading', 'text' => 'Removing funds'],
        ['type' => 'list', 'items' => ['Open the goal you want to remove funds from', 'Click "Remove from Goal"', 'Enter the amount you want to deallocate', 'The funds will return to your Savings Pool']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'Deallocated funds go back to your Savings Pool — you can then transfer them to your Wallet if needed.'],
    ]; }

    private static function deleteGoal(): array { return [
        ['type' => 'paragraph', 'text' => 'You can delete goals you no longer need. Any allocated funds will return to your Savings Pool.'],
        ['type' => 'heading', 'text' => 'Steps to delete'],
        ['type' => 'list', 'items' => ['Open the goal you want to delete', 'Click the "Delete Goal" option', 'Confirm the deletion', 'Allocated funds automatically return to Savings Pool']],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'Deletion is permanent. Make sure you really want to delete the goal before confirming.'],
    ]; }

    private static function savingsTips(): array { return [
        ['type' => 'paragraph', 'text' => 'Smart saving habits can help you build wealth over time, even as a student.'],
        ['type' => 'heading', 'text' => 'Practical tips'],
        ['type' => 'list', 'items' => ['Start small — even ₱20 per week builds up', 'Set specific, achievable goals (gadgets, school trip, gift)', 'Save right after receiving allowance (pay yourself first)', 'Avoid touching savings for impulse purchases', 'Track your progress visually with goal cards', 'Celebrate small milestones to stay motivated']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'Saving ₱50 per week for 1 year = ₱2,600. That\'s a great start to building your savings habit!'],
    ]; }

    // ===== ACCOUNT articles =====
    private static function whatIsKyc(): array { return [
        ['type' => 'paragraph', 'text' => 'KYC stands for "Know Your Customer" — it\'s a verification process required for financial services.'],
        ['type' => 'heading', 'text' => 'Why is KYC required?'],
        ['type' => 'list', 'items' => ['Comply with banking regulations', 'Protect against fraud and money laundering', 'Unlock higher transaction limits', 'Enable full access to all YMB features']],
        ['type' => 'heading', 'text' => 'What you\'ll need'],
        ['type' => 'paragraph', 'text' => 'Government-issued ID (school ID for students, or passport/driver\'s license), and a recent selfie for verification.'],
    ]; }

    private static function kycUpgrade(): array { return [
        ['type' => 'paragraph', 'text' => 'Upgrading your tier increases your wallet limits and unlocks more features.'],
        ['type' => 'heading', 'text' => 'Steps to upgrade'],
        ['type' => 'list', 'items' => ['Go to your Account Settings', 'Click "Upgrade Tier"', 'Choose the tier you want', 'Fill out the required information', 'Upload supporting documents', 'Submit your application']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'Applications are typically reviewed within 1-2 business days.'],
    ]; }

    private static function kycRejected(): array { return [
        ['type' => 'paragraph', 'text' => 'If your KYC application was rejected, our review team noted specific issues. Here\'s what to do.'],
        ['type' => 'heading', 'text' => 'Common rejection reasons'],
        ['type' => 'list', 'items' => ['Document was blurry or hard to read', 'Information didn\'t match supporting documents', 'Supporting document was expired', 'Selfie didn\'t clearly show your face']],
        ['type' => 'heading', 'text' => 'Next steps'],
        ['type' => 'paragraph', 'text' => 'Review the rejection reason in your KYC status page. You can submit a new application after addressing the issues mentioned.'],
    ]; }

    private static function kycDocuments(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank accepts various government-issued and student documents for verification.'],
        ['type' => 'heading', 'text' => 'Accepted documents'],
        ['type' => 'list', 'items' => ['Philippine Passport', 'Driver\'s License', 'Student ID (with current school year)', 'Postal ID', 'PhilID (National ID)', 'UMID']],
        ['type' => 'heading', 'text' => 'Document requirements'],
        ['type' => 'list', 'items' => ['Must be currently valid (not expired)', 'Photo must be clear and readable', 'All corners visible (no cropping)', 'Information must match your YMB profile']],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'Never send your ID photos via email or chat. Only upload through the official KYC submission form.'],
    ]; }

    private static function updateProfile(): array { return [
        ['type' => 'paragraph', 'text' => 'You can update certain profile information through your Account Settings.'],
        ['type' => 'heading', 'text' => 'What you can change'],
        ['type' => 'list', 'items' => ['Display name', 'Phone number', 'Profile picture (via Google account)', 'Notification preferences']],
        ['type' => 'heading', 'text' => 'What requires verification'],
        ['type' => 'paragraph', 'text' => 'Changes to your legal name, date of birth, or address require submitting a new KYC application with supporting documents.'],
    ]; }

    private static function changeEmail(): array { return [
        ['type' => 'paragraph', 'text' => 'Since Youth MoneyBank uses Google sign-in, your email is managed through your Google account.'],
        ['type' => 'heading', 'text' => 'To change your email'],
        ['type' => 'paragraph', 'text' => 'You\'ll need to either update the email on your Google account, or sign up with a different Google account. Note: Creating a new YMB account means starting fresh — your existing balance and transaction history won\'t transfer.'],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'Contact support before creating a new account to discuss your options.'],
    ]; }

    private static function deleteAccount(): array { return [
        ['type' => 'paragraph', 'text' => 'You can request account deletion if you no longer wish to use Youth MoneyBank.'],
        ['type' => 'heading', 'text' => 'Before deleting'],
        ['type' => 'list', 'items' => ['Withdraw all funds from your wallet and savings', 'Close any pending transactions', 'Save any transaction records you may need']],
        ['type' => 'heading', 'text' => 'How to request deletion'],
        ['type' => 'paragraph', 'text' => 'Contact our support team through the Help Center. We\'ll guide you through the deletion process, which typically takes 7-14 business days.'],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'Account deletion is permanent. We\'re required to keep some records for legal/regulatory purposes.'],
    ]; }

    // ===== SECURITY articles =====
    private static function howToLogin(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank uses Google sign-in for secure, password-free login.'],
        ['type' => 'heading', 'text' => 'Logging in'],
        ['type' => 'list', 'items' => ['Go to the YMB homepage', 'Click "Sign in with Google"', 'Select your Google account', 'Authorize YMB to access your basic profile', 'You\'ll be redirected to your dashboard']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'We never see your Google password — Google handles authentication securely.'],
    ]; }

    private static function accountLocked(): array { return [
        ['type' => 'paragraph', 'text' => 'If you can\'t access your account, it may be suspended for security reasons.'],
        ['type' => 'heading', 'text' => 'Common reasons'],
        ['type' => 'list', 'items' => ['Suspicious activity detected', 'Multiple failed login attempts', 'Account flagged for review', 'KYC information needs to be updated']],
        ['type' => 'heading', 'text' => 'What to do'],
        ['type' => 'paragraph', 'text' => 'Contact our support team with your registered email. We\'ll review your account and assist with reactivation.'],
    ]; }

    private static function isYmbSafe(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank takes your security seriously. Here\'s how we protect your money and data.'],
        ['type' => 'heading', 'text' => 'Our security measures'],
        ['type' => 'list', 'items' => ['Google OAuth login (no passwords stored)', 'Encrypted data transmission (HTTPS)', 'Atomic database transactions (no partial money movement)', 'Real-time fraud monitoring by admin team', 'Comprehensive audit logs', 'KYC verification']],
    ]; }

    private static function suspiciousActivity(): array { return [
        ['type' => 'paragraph', 'text' => 'If you notice transactions you didn\'t make or other unusual activity, act quickly.'],
        ['type' => 'heading', 'text' => 'Immediate steps'],
        ['type' => 'list', 'items' => ['Log out of all devices immediately', 'Change your Google account password', 'Review your transaction history', 'Document the suspicious transactions (screenshots, dates, amounts)', 'Contact YMB support right away']],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'Time is critical. Report suspicious activity within 24 hours for the best chance of fund recovery.'],
        ['type' => 'heading', 'text' => 'How YMB protects you'],
        ['type' => 'paragraph', 'text' => 'Our admin team monitors transactions in real-time. Unusual patterns automatically trigger reviews.'],
    ]; }

    private static function phishingScams(): array { return [
        ['type' => 'paragraph', 'text' => 'Phishing is when scammers pretend to be YMB to steal your information. Learn to spot them.'],
        ['type' => 'heading', 'text' => 'Red flags'],
        ['type' => 'list', 'items' => ['Messages asking for your password or PIN', 'Urgent threats to suspend your account', 'Links to fake YMB websites', 'Requests to send money to "verify" your account', 'Emails with poor spelling or strange grammar']],
        ['type' => 'heading', 'text' => 'YMB will NEVER'],
        ['type' => 'list', 'items' => ['Ask for your Google password', 'Ask you to send money to verify your account', 'Threaten to close your account via text/email', 'Request personal info through unofficial channels']],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'When in doubt, log in directly through the official YMB website. Never click links from suspicious messages.'],
    ]; }

    private static function privacyPolicy(): array { return [
        ['type' => 'paragraph', 'text' => 'Your privacy is fundamental to our service.'],
        ['type' => 'heading', 'text' => 'What we collect'],
        ['type' => 'list', 'items' => ['Basic profile info from Google (name, email, photo)', 'Transaction data (for record-keeping)', 'KYC documents (encrypted and access-controlled)', 'Usage analytics (to improve the service)']],
        ['type' => 'heading', 'text' => 'What we never do'],
        ['type' => 'list', 'items' => ['Sell your data to third parties', 'Share KYC documents outside required regulatory needs', 'Use your transaction patterns for advertising']],
    ]; }

    private static function sessionTimeout(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank automatically logs you out after a period of inactivity for your security.'],
        ['type' => 'heading', 'text' => 'Why this happens'],
        ['type' => 'list', 'items' => ['Protects your account if you leave a device unattended', 'Prevents unauthorized access from shared computers', 'Standard banking security practice']],
        ['type' => 'heading', 'text' => 'Session duration'],
        ['type' => 'paragraph', 'text' => 'You\'ll be logged out after 30 minutes of inactivity. Just sign in again to continue.'],
    ]; }

    // ===== ABOUT articles =====
    private static function whatIsYmb(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank is a digital banking platform designed for Filipino youth to learn about money management.'],
        ['type' => 'heading', 'text' => 'What you can do'],
        ['type' => 'list', 'items' => ['Deposit and store money in a digital wallet', 'Set savings goals and track progress', 'Learn financial literacy through money tips', 'Upgrade your account tier as you grow']],
    ]; }

    private static function whoCanUse(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank is designed for students and young adults learning to manage their finances.'],
        ['type' => 'heading', 'text' => 'Target users'],
        ['type' => 'list', 'items' => ['High school and college students', 'Young professionals starting their financial journey', 'Anyone learning about digital banking and savings']],
    ]; }

    private static function ymbFeatures(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank offers a complete digital banking experience for young users.'],
        ['type' => 'heading', 'text' => 'Core features'],
        ['type' => 'list', 'items' => ['Secure digital wallet with tier-based limits', 'Savings goals with visual progress tracking', 'Multiple deposit methods (GCash, PayPal)', 'Transaction history with reference IDs', 'KYC verification for higher limits', 'Real-time customer support', 'Educational money tips and learning resources']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'New features are added regularly based on user feedback.'],
    ]; }

    private static function feesOverview(): array { return [
        ['type' => 'paragraph', 'text' => 'Youth MoneyBank believes in transparent, accessible banking for young users.'],
        ['type' => 'heading', 'text' => 'Our fees'],
        ['type' => 'list', 'items' => ['Account opening: FREE', 'Monthly maintenance: FREE', 'GCash deposits: FREE', 'Internal transfers: FREE', 'PayPal deposits: 3.5% (charged by PayPal, not YMB)']],
        ['type' => 'callout', 'variant' => 'info', 'text' => 'We don\'t profit from hidden fees. We\'re focused on helping young Filipinos build healthy financial habits.'],
    ]; }

    private static function isYmbABank(): array { return [
        ['type' => 'paragraph', 'text' => 'This is important — Youth MoneyBank is a portfolio project, not a licensed financial institution.'],
        ['type' => 'heading', 'text' => 'What YMB IS'],
        ['type' => 'list', 'items' => ['A demonstration of digital banking application development', 'A learning platform for financial concepts', 'A portfolio piece showcasing full-stack engineering']],
        ['type' => 'heading', 'text' => 'What YMB IS NOT'],
        ['type' => 'list', 'items' => ['A licensed bank or e-money institution', 'Insured by PDIC (Philippine Deposit Insurance Corporation)', 'A substitute for real financial services']],
        ['type' => 'callout', 'variant' => 'warning', 'text' => 'For actual banking needs, please use licensed institutions like BPI, BDO, GCash, or Maya.'],
    ]; }

    private static function contactInformation(): array { return [
        ['type' => 'paragraph', 'text' => 'There are several ways to get in touch with the Youth MoneyBank team.'],
        ['type' => 'heading', 'text' => 'Support channels'],
        ['type' => 'list', 'items' => ['Help Center: Browse articles for instant answers', 'Contact Support: Submit a ticket for personalized help', 'Email: Available after submitting a support ticket']],
        ['type' => 'heading', 'text' => 'Response times'],
        ['type' => 'paragraph', 'text' => 'We typically respond to support tickets within 24 hours during business hours. Urgent issues (account locked, suspected fraud) receive priority response.'],
    ]; }
}