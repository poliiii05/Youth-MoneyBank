import { Link } from '@inertiajs/react';
import Navbar from "../../Components/Common/Navbar";
import Footer from "../../Components/Common/Footer";
import Button from "../../Components/Common/Button";
import FloatingButton from '../../Components/Support/FloatingButton';

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
            
            <Navbar />

            {/* MAIN CONTENT */}
            <main className="flex-1 flex items-center justify-center px-8 py-12">
                
                <div className="w-full max-w-7xl flex items-center justify-center gap-16">
                    
                    {/* LEFT SIDE - HERO IMAGE & CTA */}
                    <div className="flex-1 flex flex-col items-start justify-center max-w-xl">
                        <img
                            src="/images/YouthMoneyBank.png"
                            alt="Youth Money Bank"
                            className="w-full max-w-[400px] object-contain mb-8"
                        />

                        <h1 className="text-3xl font-bold text-blue-900 leading-tight mb-4">
                            Save Smart While You're Young
                        </h1>

                        <p className="text-lg text-blue-700 font-medium mb-2">
                            Open a savings account in minutes. No ID required to start.
                        </p>

                        <p className="text-base text-gray-600 mb-8">
                            Build your financial future before you turn 18. Upgrade as you grow.
                        </p>

                        {/* CTA BUTTONS */}
                        <div className="flex gap-4 w-full max-w-md">
                            <Link href="/signup" className="flex-1">
                                <Button 
                                    variant="primary"
                                    className="w-full py-3 px-8 text-lg"
                                >
                                    Get Started
                                </Button>
                            </Link>
                            
                            <Link href="/about" className="flex-1">
                                <Button 
                                    variant="secondary"
                                    className="w-full py-3 px-8 text-lg"
                                >
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT SIDE - DOWNLOAD APP */}
                    <div className="flex-1 flex items-center justify-center max-w-md">
                        <div className="p-8 bg-white rounded-2xl border border-blue-100 w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-2xl font-bold text-blue-900 text-center mb-6">
                                Download Our App
                            </h3>
                            
                            <div className="flex flex-col items-center gap-4">
                                {/* QR CODE PLACEHOLDER */}
                                <div className="w-44 h-44 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors duration-300">
                                    <div className="text-center text-blue-400">
                                        <div className="text-5xl mb-2">📱</div>
                                        <p className="text-sm font-medium">QR Code</p>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 text-center font-medium">
                                    Scan to download the app
                                </p>
                                
                                <div className="w-full border-t border-gray-200 my-2"></div>
                                
                                {/* DIRECT DOWNLOAD BUTTONS */}
                                <Button 
                                    variant="primary"
                                    className="w-full py-3"
                                    onClick={() => window.open('#', '_blank')}
                                >
                                    Download for Android
                                </Button>
                                
                                <Button 
                                    variant="primary"
                                    className="w-full py-3 bg-black hover:bg-gray-900"
                                    onClick={() => window.open('#', '_blank')}
                                >
                                    Download for iOS
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            <Footer />

          <FloatingButton isAuthenticated={false} />
            
        </div>
    );
}