import { Link } from '@inertiajs/react';
import Navbar from "../../Components/Common/Navbar";
import Footer from "../../Components/Common/Footer";
import FloatingButton from '../../Components/Support/FloatingButton';
import SavingsShowcase from '../../Components/Public/SavingsShowcase';
import { Button } from '@/Components/ui/button';

export default function Landing() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-secondary to-background">

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

                        <h1 className="text-3xl font-bold text-foreground leading-tight mb-4">
                            Save Smart While You're Young
                        </h1>

                        <p className="text-lg text-primary font-medium mb-2">
                            Open a savings account in minutes. No ID required to start.
                        </p>

                        <p className="text-base text-muted-foreground mb-8">
                            Build your financial future before you turn 18. Upgrade as you grow.
                        </p>

                        {/* CTA BUTTONS */}
                        <div className="flex gap-4 w-full max-w-md">
                            <Button asChild size="lg" className="flex-1">
                                <Link href="/signup">Get Started</Link>
                            </Button>

                            <Button asChild variant="outline" size="lg" className="flex-1">
                                <Link href="/about">Learn More</Link>
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT SIDE - ANIMATED PRODUCT SHOWCASE */}
                    <div className="flex-1 flex items-center justify-center max-w-md">
                        <SavingsShowcase />
                    </div>

                </div>

            </main>

            <Footer />

            <FloatingButton isAuthenticated={false} />

        </div>
    );
}