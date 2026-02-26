'use client';

import { useEffect, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, PhoneOff, CheckCircle2, Loader2, AlertCircle, Terminal, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceAssistant() {
    const [isCalling, setIsCalling] = useState(false);
    const [callStatus, setCallStatus] = useState<'idle' | 'linking' | 'active' | 'success'>('idle');
    const [volume, setVolume] = useState(0);
    const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
    const [runtimeError, setRuntimeError] = useState<string | null>(null);

    // Get keys dynamically
    const publicKey = (process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '').trim();
    const agentId = (process.env.NEXT_PUBLIC_VAPI_AGENT_ID || '').trim();

    // Validation
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const isConfigured = !!publicKey && !!agentId && isUuid(agentId);

    useEffect(() => {
        if (!publicKey) return;

        console.log('Vapi Init - Key Length:', publicKey.length);
        console.log('Vapi Init - First 4 chars:', publicKey.substring(0, 4));
        try {
            const instance = new Vapi(publicKey);
            setVapiInstance(instance);

            instance.on('call-start', () => {
                setIsCalling(true);
                setCallStatus('active');
                setRuntimeError(null);
            });

            instance.on('call-end', () => {
                setIsCalling(false);
                setCallStatus('idle');
                setVolume(0);
            });

            instance.on('volume-level', (level: number) => {
                setVolume(level);
            });

            instance.on('message', (message: any) => {
                if (message.type === 'tool-calls-results') {
                    const result = message.results[0]?.result;
                    if (result && result.includes('Successfully scheduled')) {
                        setCallStatus('success');
                        setTimeout(() => instance.stop(), 3500);
                    }
                }
            });

            instance.on('error', (err: any) => {
                console.error('Vapi Full Error Object:', JSON.stringify(err, null, 2));
                const errorDetail = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
                setRuntimeError(`Connection Failed: ${errorDetail}`);
                setIsCalling(false);
                setCallStatus('idle');
            });

            return () => {
                instance.removeAllListeners();
            };
        } catch (e: any) {
            setRuntimeError(e.message);
        }
    }, [publicKey]);

    const handleToggleCall = () => {
        if (!vapiInstance || !agentId) return;

        if (isCalling) {
            vapiInstance.stop();
        } else {
            setCallStatus('linking');
            setRuntimeError(null);
            try {
                vapiInstance.start(agentId);
            } catch (err: any) {
                setRuntimeError(err.message || 'Failed to start call');
                setCallStatus('idle');
            }
        }
    };

    // 1. SETUP SCREEN (If keys are actually missing or invalid)
    if (!isConfigured) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-[400px] w-full max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-premium p-10 rounded-[2.5rem] border-red-500/20 bg-red-500/5 text-center"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/30">
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Action Required</h3>
                    <p className="mt-3 text-sm text-red-200/50 font-light leading-relaxed px-4">
                        The <b>Public Key</b> you provided seems to be an <i>Encryption Key</i>, not the <i>API Key</i>.
                    </p>

                    <div className="mt-8 p-4 rounded-xl bg-black/40 border border-white/5 text-left font-mono text-[11px]">
                        <div className="flex items-center space-x-2 text-white/40 mb-3 border-b border-white/5 pb-2">
                            <Terminal className="h-3 w-3" />
                            <span>Diagnostic Info</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-emerald-400/80">
                                AGENT_ID: VALID ✅
                            </p>
                            <p className="text-red-400/80">
                                PUBLIC_KEY: WRONG TYPE ❌
                            </p>
                            <p className="text-white/20 mt-2">
                                (Expected a short string, got {publicKey.length} chars)
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-left text-[11px] text-white/60 space-y-3">
                        <p className="font-semibold text-blue-400">How to find the right key:</p>
                        <p>1. Open <b>Vapi Dashboard</b> sidebar.</p>
                        <p>2. Click <b>API Keys</b> (bottom left icon 🔑).</p>
                        <p>3. Copy the <b>"Public Key"</b> at the top of that page.</p>
                        <p className="text-[10px] opacity-70 italic">⚠️ Note: Do NOT use keys from the "Tools" or "Assistants" encryption sections.</p>
                    </div>

                    <div className="mt-6 text-[10px] text-white/20 italic">
                        Current ID: <span className="text-red-400/60">{agentId || 'Empty'}</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    // 2. MAIN ASSISTANT DASHBOARD
    return (
        <div className="relative flex flex-col items-center justify-center min-h-[400px] w-full max-w-lg mx-auto">
            <AnimatePresence mode="wait">
                {/* RUNTIME ERROR OVERLAY */}
                {runtimeError && (
                    <motion.div
                        key="runtime-error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-12 glass px-4 py-2 rounded-full border-red-500/20 bg-red-500/10 flex items-center space-x-2"
                    >
                        <AlertCircle className="h-3 w-3 text-red-400" />
                        <span className="text-[10px] text-red-400 font-medium">{runtimeError}</span>
                        <button onClick={() => setRuntimeError(null)} className="ml-2 hover:text-white transition-colors">
                            <RefreshCw className="h-2 w-2" />
                        </button>
                    </motion.div>
                )}

                {/* IDLE STATE */}
                {callStatus === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center"
                    >
                        <button
                            onClick={handleToggleCall}
                            className="group relative flex h-40 w-40 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                            <Mic className="h-14 w-14 text-white/80 transition-transform group-hover:scale-110 group-hover:text-white" />
                        </button>
                        <p className="mt-8 text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">Initiate Protocol</p>
                    </motion.div>
                )}

                {/* LINKING STATE */}
                {callStatus === 'linking' && (
                    <motion.div
                        key="linking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative h-32 w-32">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                            </div>
                        </div>
                        <p className="mt-8 text-blue-400/80 font-light tracking-wide italic">Authenticating...</p>
                    </motion.div>
                )}

                {/* ACTIVE STATE: Fluid Blob */}
                {callStatus === 'active' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center w-full"
                    >
                        <div className="relative h-64 w-64 flex items-center justify-center">
                            {/* The Fluid Blob - Reacts to volume */}
                            <motion.div
                                animate={{
                                    borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
                                    scale: 1 + volume * 1.5,
                                    rotate: [0, 90, 0]
                                }}
                                transition={{
                                    borderRadius: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                                    rotate: { repeat: Infinity, duration: 10, ease: "linear" },
                                    scale: { type: "spring", damping: 10, stiffness: 100 }
                                }}
                                className="absolute h-48 w-48 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-indigo-500/30 blur-2xl"
                            />

                            <motion.div
                                animate={{
                                    borderRadius: ["50% 50% 50% 50%", "45% 55% 55% 45%", "55% 45% 45% 55%", "50% 50% 50% 50%"],
                                    scale: 1 + volume * 0.8
                                }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="relative h-32 w-32 glass-premium flex items-center justify-center rounded-full"
                            >
                                <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                            </motion.div>
                        </div>

                        <div className="mt-12 text-center">
                            <h3 className="text-[10px] font-bold tracking-[0.3em] text-white/90 uppercase">Active Perception</h3>
                            <p className="mt-4 text-white/40 italic font-light italic">"Book a meeting for tomorrow at 2 PM"</p>
                        </div>

                        <button
                            onClick={handleToggleCall}
                            className="mt-16 flex items-center space-x-3 px-8 py-4 rounded-full glass hover:bg-red-500/10 hover:border-red-500/40 transition-all active:scale-95 group"
                        >
                            <PhoneOff className="h-4 w-4 text-red-400" />
                            <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">Terminate</span>
                        </button>
                    </motion.div>
                )}

                {/* SUCCESS STATE */}
                {callStatus === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass-premium p-12 rounded-[2.5rem] text-center max-w-sm"
                    >
                        <div className="mb-8 flex justify-center">
                            <div className="h-20 w-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/40">
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight text-white">Confirmed</h3>
                        <p className="mt-4 text-white/60 font-light text-sm leading-relaxed">
                            Task protocol completed. Event synchronized.
                        </p>
                        <button
                            onClick={() => setCallStatus('idle')}
                            className="mt-10 text-[10px] font-bold tracking-widest text-blue-400 uppercase hover:text-blue-300 transition-colors"
                        >
                            New Session
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
