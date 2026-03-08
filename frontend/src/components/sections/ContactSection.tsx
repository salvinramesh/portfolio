'use client';

import { useState } from 'react';
import { Mail, Phone, Github, Linkedin, Twitter, Instagram, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const socialLinks = [
        { name: 'GitHub', icon: Github, url: 'https://github.com/salvinramesh', color: 'hover:text-purple-500' },
        { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/salvinramesh', color: 'hover:text-blue-500' },
        { name: 'X / Twitter', icon: Twitter, url: 'https://x.com/salvinramesh1', color: 'hover:text-white' },
        { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/salvinramesh', color: 'hover:text-pink-500' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('All fields are required.');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                toast.success('Transmission Successful! Salvin will get back to you soon.');
                setFormData({ name: '', email: '', message: '' });
            } else {
                throw new Error(data.error || 'Transmission failed.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Transmission Encountered an Error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-20 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-900 to-transparent"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-12 font-orbitron">
                    <span className="text-glow-purple">INITIATE</span> CONTACT
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="cyber-box bg-black/40 border border-cyan-900/50 p-6 rounded-xl hover:border-cyan-500/50 transition-all duration-300">
                            <h3 className="text-xl font-bold font-orbitron text-cyan-400 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                                TRANSMISSION CHANNELS
                            </h3>

                            <div className="space-y-6">
                                <a href="mailto:salvinramesh@gmail.com" className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors group">
                                    <div className="p-3 bg-cyan-950/30 rounded-lg group-hover:bg-cyan-500/20 border border-cyan-900 group-hover:border-cyan-500/50 transition-all">
                                        <Mail className="w-5 h-5 text-cyan-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-mono mb-1">EMAIL FREQUENCY</div>
                                        <div className="font-rajdhani font-medium text-lg">salvinramesh@gmail.com</div>
                                    </div>
                                </a>

                                <a href="tel:+919895762262" className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors group">
                                    <div className="p-3 bg-purple-950/30 rounded-lg group-hover:bg-purple-500/20 border border-purple-900 group-hover:border-purple-500/50 transition-all">
                                        <Phone className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 font-mono mb-1">SECURE LINE</div>
                                        <div className="font-rajdhani font-medium text-lg">+91 9895762262</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Social Grid */}
                        <div className="grid grid-cols-4 gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`cyber-box bg-black/40 border border-gray-800 p-4 rounded-xl flex items-center justify-center transition-all duration-300 ${social.color} hover:border-white/20 hover:bg-white/5`}
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-6 h-6" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Message Form */}
                    <div className="cyber-box bg-black/40 border border-gray-800 p-8 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Send className="w-24 h-24" />
                        </div>

                        <h3 className="text-xl font-bold font-orbitron text-purple-400 mb-6">ENCRYPTED MESSAGE</h3>

                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
                                    <div className="w-20 h-20 border-2 border-cyan-500 rounded-full flex items-center justify-center relative z-10 bg-black shadow-[0_0_30px_rgba(0,243,255,0.3)]">
                                        <Send className="w-10 h-10 text-cyan-400" />
                                    </div>
                                    {/* Orbital rings */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-t border-b border-purple-500/30 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black font-orbitron text-cyan-400 tracking-wider">
                                        TRANSMISSION SECURED
                                    </h3>
                                    <p className="font-mono text-sm text-gray-400 max-w-xs mx-auto">
                                        <span className="text-green-400">STATUS:</span> DATA PACKET DELIVERED TO MAINFRAME.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsSuccess(false)}
                                    className="px-6 py-2 mt-4 bg-transparent border border-cyan-500/50 rounded text-cyan-400 font-mono text-xs tracking-widest hover:bg-cyan-950/30 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:border-cyan-400 transition-all group"
                                >
                                    <span className="group-hover:text-white transition-colors">INITIATE NEW LINK</span>
                                </button>
                            </div>
                        ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-gray-500 uppercase">Identity</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-800 rounded p-2 text-cyan-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm" 
                                    placeholder="ENTER NAME" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-gray-500 uppercase">Coordinates</label>
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-800 rounded p-2 text-cyan-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm" 
                                    placeholder="ENTER EMAIL" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-gray-500 uppercase">Data Packet</label>
                                <textarea 
                                    rows={4} 
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-800 rounded p-2 text-cyan-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm" 
                                    placeholder="ENTER MESSAGE CONTENT..."
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-purple-900 to-cyan-900 border border-cyan-500/30 rounded text-white font-bold font-orbitron tracking-widest hover:from-purple-700 hover:to-cyan-700 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        TRANSMITTING...
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        TRANSMIT
                                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
