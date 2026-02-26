import VoiceAssistant from "@/components/VoiceAssistant";
import { Sparkles, Brain, Clock, ShieldCheck } from "lucide-react";

export default function Home() {
    return (
        <main className="relative min-h-screen bg-mesh selection:bg-blue-500/30">
            {/* Global Gradient Overlay */}
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,17,17,0)_0%,rgba(3,3,3,1)_100%)]" />

            {/* Navigation */}
            <nav className="relative z-10 container mx-auto flex items-center justify-between p-8">
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform" />
                    <span className="text-xl font-semibold tracking-tight text-white/90">Vikara<span className="text-blue-400">.AI</span></span>
                </div>
            </nav>

            <section className="relative z-10 container mx-auto mt-24 px-6 text-center">
                <MotionHeader initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="inline-flex items-center space-x-2 rounded-full glass px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-blue-400">
                        <Sparkles className="h-3 w-3" />
                        <span>Voice Intelligence 2.0</span>
                    </div>

                    <h1 className="mt-10 text-6xl font-light tracking-tight sm:text-8xl text-white">
                        Design <span className="italic font-serif">by</span> Voice.
                    </h1>

                </MotionHeader>

                <div className="mt-20">
                    <VoiceAssistant />
                </div>

                {/* Features Grid */}
                <div className="mt-40 grid gap-6 md:grid-cols-3">
                    {[
                        {
                            icon: Brain,
                            title: "Cognitive Sync",
                            desc: "Understands intent, contexts, and nuances in real-time."
                        },
                        {
                            icon: Clock,
                            title: "Instant Utility",
                            desc: "Direct integration with minimal latency and high precision."
                        },
                        {
                            icon: ShieldCheck,
                            title: "Private Core",
                            desc: "Privacy-first architecture, encrypted by design."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="glass group p-10 rounded-[2rem] text-left transition-all hover:bg-white/[0.08] hover:border-white/20">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-blue-400 group-hover:scale-110 transition-transform">
                                <feature.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-medium text-white">{feature.title}</h3>
                            <p className="mt-3 text-sm font-light leading-relaxed text-white/40">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="relative z-10 mt-40 border-t border-white/5 p-16 text-center">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/20">
                    &copy; MMXXVI Vikara Intelligence.
                </p>
            </footer>
        </main>
    );
}

// Wrapper to avoid build issues while using motion tags directly
const MotionHeader = ({ children, initial, animate }: any) => (
    <div style={{ transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {children}
    </div>
);

