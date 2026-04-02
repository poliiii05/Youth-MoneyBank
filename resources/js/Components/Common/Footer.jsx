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
            <footer className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200 mt-auto">
                <div className="max-w-7xl mx-auto px-8 py-5">
                    
                    {/* Top - Centered Copyright with Icon ito ha */}
                    <div className="flex justify-center items-center gap-2 mb-3">
                        <span className="text-blue-600 text-xl">🏦</span>
                        <p className="text-sm text-gray-800 font-semibold">
                            Youth Money Bank © {new Date().getFullYear()} — Empowering Your Future
                        </p>
                    </div>

                    {/* Ito yung Divider na may line na design hehe*/}
                    <div className="
                    border-t border-blue-300 mb-3">
                    </div>
                    
                    {/* Bottom - Centered Links part nga nito */}
                    <div className=
                    "flex flex-wrap justify-center items-center gap-3 text-sm">
            
                            <span className="text-base"> {/* ito yung start sa babang part, ito yung icon */}
                                ✉️
                            </span> 

                            <span className="text-gray-700 font-medium"> {/* ito yung part ng contact us na text */}
                                Contact Us:
                            </span>
                            
                            <a href="mailto:help@ymb.com" 
                            className="text-blue-600 hover:text-blue-800 transition-colors font-medium hover:underline">
                           
                                help@ymb.com</a>   {/* ito yung part ng may link hehe uhmki */}

                        <span className="text-gray-400">•</span> {/* design lang ito yung maliit na dot */}


                        {/* Privacy Policy Modal yung napipindot */}
                        <button
                            onClick={() => setShowPrivacy(true)}
                            className="text-gray-700 hover:text-blue-700 transition-colors font-medium cursor-pointer">
                            Privacy Policy
                        </button>

                        <span className="text-gray-400">•</span> {/* design lang ito yung maliit na dot */}

                        {/* Terms & Conditions Modal Trigger */}
                        <button
                            onClick={() => setShowTerms(true)}
                            className="text-gray-700 hover:text-blue-700 transition-colors font-medium cursor-pointer">
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