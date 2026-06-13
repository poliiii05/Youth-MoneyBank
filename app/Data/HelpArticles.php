<?php

namespace App\Data;

class HelpArticles
{
    /**
     * Categories with slugs and metadata.
     */
    public static function categories(): array
    {
        return [
            [
                'slug' => 'deposit',
                'name' => 'Deposit',
                'icon' => 'ArrowDownToLine',
                'description' => 'Adding money to your wallet',
                'color' => 'blue',
            ],
            [
                'slug' => 'savings',
                'name' => 'Savings & Goals',
                'icon' => 'Target',
                'description' => 'Saving money and tracking goals',
                'color' => 'emerald',
            ],
            [
                'slug' => 'account',
                'name' => 'Account & KYC',
                'icon' => 'UserCircle',
                'description' => 'Verification and account settings',
                'color' => 'purple',
            ],
            [
                'slug' => 'security',
                'name' => 'Security',
                'icon' => 'Shield',
                'description' => 'Account safety and login',
                'color' => 'amber',
            ],
            [
                'slug' => 'about',
                'name' => 'About Youth MoneyBank',
                'icon' => 'Info',
                'description' => 'How YMB works',
                'color' => 'slate',
            ],
        ];
    }

    /**
     * All articles indexed by category slug.
     */
    public static function articles(): array
    {
        return [
            'deposit' => [
                [
                    'slug' => 'how-to-add-money',
                    'title' => 'How do I add money to my wallet?',
                    'summary' => 'Step-by-step guide on depositing funds',
                    'content' => self::howToAddMoney(),
                    'related' => ['deposit-not-reflected', 'deposit-limits'],
                ],
                [
                    'slug' => 'deposit-not-reflected',
                    'title' => 'My deposit is not reflecting in my wallet',
                    'summary' => 'What to do when your deposit takes too long',
                    'content' => self::depositNotReflected(),
                    'related' => ['how-to-add-money', 'deposit-limits'],
                ],
                [
                    'slug' => 'deposit-limits',
                    'title' => 'What are my deposit limits?',
                    'summary' => 'Understanding tier-based wallet limits',
                    'content' => self::depositLimits(),
                    'related' => ['kyc-upgrade', 'how-to-add-money'],
                ],
            ],
            'savings' => [
                [
                    'slug' => 'how-to-set-goal',
                    'title' => 'How do I set a savings goal?',
                    'summary' => 'Creating and managing your savings goals',
                    'content' => self::howToSetGoal(),
                    'related' => ['savings-vs-wallet', 'goal-not-progressing'],
                ],
                [
                    'slug' => 'savings-vs-wallet',
                    'title' => 'What\'s the difference between Wallet and Savings?',
                    'summary' => 'Understanding the two balance types',
                    'content' => self::savingsVsWallet(),
                    'related' => ['how-to-set-goal'],
                ],
                [
                    'slug' => 'goal-not-progressing',
                    'title' => 'My goal is not progressing',
                    'summary' => 'How to allocate funds to your goals',
                    'content' => self::goalNotProgressing(),
                    'related' => ['how-to-set-goal'],
                ],
            ],
            'account' => [
                [
                    'slug' => 'what-is-kyc',
                    'title' => 'What is KYC and why do I need it?',
                    'summary' => 'Understanding identity verification',
                    'content' => self::whatIsKyc(),
                    'related' => ['kyc-upgrade', 'kyc-rejected'],
                ],
                [
                    'slug' => 'kyc-upgrade',
                    'title' => 'How do I upgrade my tier?',
                    'summary' => 'Step-by-step tier upgrade process',
                    'content' => self::kycUpgrade(),
                    'related' => ['what-is-kyc', 'deposit-limits'],
                ],
                [
                    'slug' => 'kyc-rejected',
                    'title' => 'My KYC application was rejected',
                    'summary' => 'What to do after a rejected application',
                    'content' => self::kycRejected(),
                    'related' => ['kyc-upgrade', 'what-is-kyc'],
                ],
            ],
            'security' => [
                [
                    'slug' => 'how-to-login',
                    'title' => 'How do I log in?',
                    'summary' => 'Sign in with Google',
                    'content' => self::howToLogin(),
                    'related' => ['account-locked'],
                ],
                [
                    'slug' => 'account-locked',
                    'title' => 'My account is locked or suspended',
                    'summary' => 'What to do if you can\'t access your account',
                    'content' => self::accountLocked(),
                    'related' => ['how-to-login'],
                ],
                [
                    'slug' => 'is-ymb-safe',
                    'title' => 'Is Youth MoneyBank safe?',
                    'summary' => 'Our security practices',
                    'content' => self::isYmbSafe(),
                    'related' => ['account-locked'],
                ],
            ],
            'about' => [
                [
                    'slug' => 'what-is-ymb',
                    'title' => 'What is Youth MoneyBank?',
                    'summary' => 'Introduction to YMB',
                    'content' => self::whatIsYmb(),
                    'related' => ['who-can-use'],
                ],
                [
                    'slug' => 'who-can-use',
                    'title' => 'Who can use Youth MoneyBank?',
                    'summary' => 'Eligibility and target users',
                    'content' => self::whoCanUse(),
                    'related' => ['what-is-ymb'],
                ],
            ],
        ];
    }

    /**
     * Get a single article by category + slug.
     */
    public static function getArticle(string $categorySlug, string $articleSlug): ?array
    {
        $all = self::articles();
        if (!isset($all[$categorySlug])) return null;
        
        foreach ($all[$categorySlug] as $article) {
            if ($article['slug'] === $articleSlug) {
                return [
                    ...$article,
                    'category_slug' => $categorySlug,
                ];
            }
        }
        return null;
    }

    /**
     * Get related articles by slugs.
     */
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

    /**
     * Get category by slug.
     */
    public static function getCategory(string $slug): ?array
    {
        foreach (self::categories() as $cat) {
            if ($cat['slug'] === $slug) return $cat;
        }
        return null;
    }

    // ====================================================
    // ARTICLE CONTENT
    // ====================================================

    private static function howToAddMoney(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Adding money to your Youth MoneyBank wallet is quick and easy. Follow these steps to deposit funds.'],
            ['type' => 'heading', 'text' => 'Step-by-step guide'],
            ['type' => 'list', 'items' => [
                'Log in to your YMB account',
                'On the Dashboard, click the "Add Money" button',
                'Choose your preferred deposit method (PayPal or GCash)',
                'Enter the amount you want to deposit (minimum ₱50)',
                'Confirm the transaction',
                'You\'ll receive a confirmation once the deposit is successful',
            ]],
            ['type' => 'heading', 'text' => 'Processing time'],
            ['type' => 'paragraph', 'text' => 'Deposits are typically reflected in your wallet within 5-10 minutes. During off-peak hours, this may take up to 1 hour.'],
            ['type' => 'callout', 'variant' => 'info', 'text' => 'For first-time deposits, please ensure your account is verified to avoid delays.'],
        ];
    }

    private static function depositNotReflected(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'If your deposit hasn\'t appeared in your wallet, don\'t worry. Here\'s what to check before contacting support.'],
            ['type' => 'heading', 'text' => 'Common causes'],
            ['type' => 'list', 'items' => [
                'Processing delay (most common — usually resolves within 1 hour)',
                'Incorrect reference number used during bank transfer',
                'Daily deposit limit reached for your tier',
                'Account verification pending',
            ]],
            ['type' => 'heading', 'text' => 'What to do'],
            ['type' => 'list', 'items' => [
                'Wait at least 30 minutes after initiating the deposit',
                'Check your Transactions page to see if it\'s pending',
                'Verify you used the correct reference number',
                'Make sure you haven\'t exceeded your tier\'s wallet limit',
                'Take a screenshot of your payment confirmation as proof',
            ]],
            ['type' => 'callout', 'variant' => 'warning', 'text' => 'Never share your reference number, account number, or payment screenshots with anyone except official YMB Support.'],
            ['type' => 'heading', 'text' => 'Still not resolved?'],
            ['type' => 'paragraph', 'text' => 'If your deposit hasn\'t appeared after 1 hour, please contact our support team with your reference number and payment proof.'],
        ];
    }

    private static function depositLimits(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Youth MoneyBank uses a tiered limit system based on your KYC verification level.'],
            ['type' => 'heading', 'text' => 'Tier-based limits'],
            ['type' => 'list', 'items' => [
                'Tier 1 (Starter): ₱5,000 maximum wallet balance — default for new users',
                'Tier 2 (Builder): ₱20,000 maximum wallet balance — basic verification required',
                'Tier 3 (Achiever): ₱100,000 maximum wallet balance — full verification required',
            ]],
            ['type' => 'heading', 'text' => 'Upgrading your tier'],
            ['type' => 'paragraph', 'text' => 'To increase your limits, submit a KYC upgrade application from your Account settings. Verification typically takes 1-2 business days.'],
        ];
    }

    private static function howToSetGoal(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Savings goals help you save for specific things like gadgets, school supplies, or emergencies.'],
            ['type' => 'heading', 'text' => 'Creating a goal'],
            ['type' => 'list', 'items' => [
                'Go to the Goals page from the sidebar',
                'Click "Create New Goal"',
                'Enter a name (e.g., "New Phone")',
                'Set a target amount',
                'Choose an icon (optional)',
                'Click "Save"',
            ]],
            ['type' => 'heading', 'text' => 'Allocating money to your goal'],
            ['type' => 'paragraph', 'text' => 'After creating a goal, you need to allocate money from your Savings pool. Click on the goal, then use the "Add to Goal" button to transfer funds.'],
        ];
    }

    private static function savingsVsWallet(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Your Youth MoneyBank account has two balance types, each with a different purpose.'],
            ['type' => 'heading', 'text' => 'Main Wallet'],
            ['type' => 'paragraph', 'text' => 'Your spending money. Use this for transactions, transfers, and daily expenses. Money in your wallet is immediately available.'],
            ['type' => 'heading', 'text' => 'Savings Pool'],
            ['type' => 'paragraph', 'text' => 'Money set aside for goals. You can transfer money from your wallet to savings, then allocate it to specific goals. Helps you avoid spending money meant for saving.'],
            ['type' => 'callout', 'variant' => 'info', 'text' => 'Total wallet limit includes both your Main Wallet and Savings Pool combined.'],
        ];
    }

    private static function goalNotProgressing(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'If your goal\'s progress isn\'t moving, it usually means you haven\'t allocated funds to it yet.'],
            ['type' => 'heading', 'text' => 'How to allocate funds'],
            ['type' => 'list', 'items' => [
                'First, move money from your Wallet to your Savings Pool using the "Save" button',
                'Then click on your goal to open its details',
                'Click "Add to Goal" and enter the amount to allocate',
                'The progress bar will update immediately',
            ]],
        ];
    }

    private static function whatIsKyc(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'KYC stands for "Know Your Customer" — it\'s a verification process required for financial services.'],
            ['type' => 'heading', 'text' => 'Why is KYC required?'],
            ['type' => 'list', 'items' => [
                'Comply with banking regulations',
                'Protect against fraud and money laundering',
                'Unlock higher transaction limits',
                'Enable full access to all YMB features',
            ]],
            ['type' => 'heading', 'text' => 'What you\'ll need'],
            ['type' => 'paragraph', 'text' => 'Government-issued ID (school ID for students, or passport/driver\'s license), and a recent selfie for verification.'],
        ];
    }

    private static function kycUpgrade(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Upgrading your tier increases your wallet limits and unlocks more features.'],
            ['type' => 'heading', 'text' => 'Steps to upgrade'],
            ['type' => 'list', 'items' => [
                'Go to your Account Settings',
                'Click "Upgrade Tier"',
                'Choose the tier you want to upgrade to',
                'Fill out the required information',
                'Upload supporting documents',
                'Submit your application',
            ]],
            ['type' => 'callout', 'variant' => 'info', 'text' => 'Applications are typically reviewed within 1-2 business days. You\'ll receive a notification once approved.'],
        ];
    }

    private static function kycRejected(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'If your KYC application was rejected, our review team noted specific issues. Here\'s what to do.'],
            ['type' => 'heading', 'text' => 'Common rejection reasons'],
            ['type' => 'list', 'items' => [
                'Document was blurry or hard to read',
                'Information didn\'t match supporting documents',
                'Supporting document was expired',
                'Selfie didn\'t clearly show your face',
            ]],
            ['type' => 'heading', 'text' => 'Next steps'],
            ['type' => 'paragraph', 'text' => 'Review the rejection reason in your KYC status page. You can submit a new application after addressing the issues mentioned. Make sure your documents are clear, current, and match the information you provided.'],
        ];
    }

    private static function howToLogin(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Youth MoneyBank uses Google sign-in for secure, password-free login.'],
            ['type' => 'heading', 'text' => 'Logging in'],
            ['type' => 'list', 'items' => [
                'Go to the YMB homepage',
                'Click "Sign in with Google"',
                'Select your Google account',
                'Authorize YMB to access your basic profile info',
                'You\'ll be redirected to your dashboard',
            ]],
            ['type' => 'callout', 'variant' => 'info', 'text' => 'We never see your Google password — Google handles authentication securely.'],
        ];
    }

    private static function accountLocked(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'If you can\'t access your account, your account may be suspended for security reasons.'],
            ['type' => 'heading', 'text' => 'Common reasons'],
            ['type' => 'list', 'items' => [
                'Suspicious activity detected',
                'Multiple failed login attempts',
                'Account flagged for review',
                'KYC information needs to be updated',
            ]],
            ['type' => 'heading', 'text' => 'What to do'],
            ['type' => 'paragraph', 'text' => 'Contact our support team with your registered email address. We\'ll review your account and assist with reactivation.'],
        ];
    }

    private static function isYmbSafe(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Youth MoneyBank takes your security seriously. Here\'s how we protect your money and data.'],
            ['type' => 'heading', 'text' => 'Our security measures'],
            ['type' => 'list', 'items' => [
                'Google OAuth login (no passwords stored)',
                'Encrypted data transmission (HTTPS)',
                'Atomic database transactions (no partial money movement)',
                'Real-time fraud monitoring by our admin team',
                'Comprehensive audit logs for all admin actions',
                'KYC verification to prevent identity fraud',
            ]],
            ['type' => 'callout', 'variant' => 'info', 'text' => 'Youth MoneyBank is a portfolio project demonstrating banking-grade safeguards. For real banking needs, please use a licensed financial institution.'],
        ];
    }

    private static function whatIsYmb(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Youth MoneyBank is a digital banking platform designed for Filipino youth to learn about money management.'],
            ['type' => 'heading', 'text' => 'What you can do'],
            ['type' => 'list', 'items' => [
                'Deposit and store money in a digital wallet',
                'Set savings goals and track progress',
                'Learn financial literacy through money tips',
                'Upgrade your account tier as you grow',
            ]],
            ['type' => 'heading', 'text' => 'Built for portfolio demonstration'],
            ['type' => 'paragraph', 'text' => 'This project showcases full-stack banking application development including atomic transactions, role-based admin tools, audit logging, and modern UX patterns.'],
        ];
    }

    private static function whoCanUse(): array
    {
        return [
            ['type' => 'paragraph', 'text' => 'Youth MoneyBank is designed for students and young adults learning to manage their finances.'],
            ['type' => 'heading', 'text' => 'Target users'],
            ['type' => 'list', 'items' => [
                'High school and college students',
                'Young professionals starting their financial journey',
                'Anyone learning about digital banking and savings',
            ]],
            ['type' => 'callout', 'variant' => 'info', 'text' => 'This is a portfolio project — for actual banking needs, please use licensed institutions like BPI, BDO, GCash, or Maya.'],
        ];
    }
}