import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { createPortal } from 'react-dom';
import PrivacyPolicyModal from '../../Pages/Public/PrivacyPolicyModal.jsx';
import TermsAndConditionsModal from '../../Pages/Public/TermsAndConditionsModal.jsx';

export default function Footer() {
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    return (
        <>
            <footer className="bg-gradient-to-r from-secondary to-secondary/60 border-t-2 border-border mt-auto">
                <div className="max-w-7xl mx-auto px-8 py-5">
                    
                    {/* Top - Centered Copyright with Icon */}
                    <div className="flex justify-center items-center gap-2 mb-3">
                        <span className="text-primary text-xl">🏦</span>
                        <p className="text-sm text-foreground font-semibold">
                            Youth Money Bank © {new Date().getFullYear()} — Empowering Your Future
                        </p>
                    </div>

                    {/* Divider line*/}
                    <div className="
                    border-t border-border mb-3">
                    </div>
                    
                    {/* Bottom - Centered Links*/}
                    <div className=
                    "flex flex-wrap justify-center items-center gap-3 text-sm">
            
                            <span className="text-base"> 
                                ✉️
                            </span> 

                            <span className="text-muted-foreground font-medium">
                                Contact Us:
                            </span>
                            
                            <a href="mailto:help@ymb.com" 
                            className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline">
                           
                                help@ymb.com</a>   

                        <span className="text-gray-400">•</span> 


                        {/* Privacy Policy pop up modals */}
                        <button
                            onClick={() => setShowPrivacy(true)}
                            className="text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer">
                            Privacy Policy
                        </button>

                        <span className="text-gray-400">•</span> {/* design dot */}

                        {/* Terms & Conditions Modal Trigger */}
                        <button
                            onClick={() => setShowTerms(true)}
                            className="text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer">
                            Terms & Conditions
                        </button>
                       
                        
                    </div>
                </div>
            </footer>

            {/* Modals - Rendered at document root using Portal */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    <PrivacyPolicyModal 
                        isOpen={showPrivacy} 
                        onClose={() => setShowPrivacy(false)} 
                    />

                    <TermsAndConditionsModal 
                        isOpen={showTerms} 
                        onClose={() => setShowTerms(false)} 
                    />
                </>,
                document.body
            )}
        </>
    );
}