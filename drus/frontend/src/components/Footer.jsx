import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="mt-auto bg-bg-footer border-t border-white/5 pt-16 pb-8 transition-colors">
            <div className="w-full mx-auto px-4 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-1 space-y-6">
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-mint-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-105 transition-transform">
                                <Activity className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">DRUS</span>
                        </Link>
                        <p className="text-xs text-white/60 leading-tight">
                            Empowering developers to track, analyze, and showcase their technical growth across all major platforms.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/Hari-krish-na-n"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="https://x.com/Krishna9643950"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://linkedin.com/in/harikrishna-n-8522382a6/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Platform</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-xs text-white/60 hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                            <li><Link to="/analytics" className="text-xs text-white/60 hover:text-emerald-400 transition-colors">Analytics</Link></li>
                            <li><Link to="/repositories" className="text-xs text-white/60 hover:text-emerald-400 transition-colors">Repositories</Link></li>
                            <li><Link to="/courses" className="text-xs text-white/60 hover:text-emerald-400 transition-colors">Courses</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Support</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-xs text-white/60 hover:text-emerald-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-xs text-white/60 hover:text-emerald-400 transition-colors">API Reference</a></li>
                            <li><a href="#" className="text-xs text-white/60 hover:text-emerald-400 transition-colors">Community</a></li>
                            <li><a href="#" className="text-xs text-white/60 hover:text-emerald-400 transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    {/* Status Section */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/90">System Status</h4>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-white/40 uppercase">API Status</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-500">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-white/40 uppercase">Sync Engine</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-500">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest w-full opacity-60">
                        © {new Date().getFullYear()} DRUS System Hub. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
