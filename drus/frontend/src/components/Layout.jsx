import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart2,
    Settings,
    LogOut,
    User as UserIcon,
    Activity,
    Folder,
    GraduationCap,
    Menu,
    FileText,
    Brain,
    X
} from 'lucide-react';
import { cn } from '../utils';
import { Footer } from './Footer';
import { motion, AnimatePresence } from 'motion/react';

export const Layout = ({ user, onLogout }) => {
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/repositories', icon: Folder, label: 'Repositories' },
        { to: '/courses', icon: GraduationCap, label: 'Courses' },
        { to: '/platforms', icon: Settings, label: 'Platforms' },
        { to: '/ai-profile', icon: Brain, label: 'AI Profile' },
        { to: '/reports', icon: FileText, label: 'Reports' },
        { to: '/profile', icon: UserIcon, label: 'Profile' },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-bg-main text-text-primary font-sans">
            {/* Top Navigation Header */}
            <header className="sticky top-0 z-50 bg-bg-header backdrop-blur-md border-b border-border-subtle/50 transition-all duration-300">
                <div className="w-full mx-auto px-4 sm:px-8 lg:px-12">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center gap-3 group">
                                <motion.div 
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-mint-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow"
                                >
                                    <Activity className="text-white w-6 h-6" />
                                </motion.div>
                                <span className="text-2xl font-black tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-mint-400 transition-all duration-300">DRUS</span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex flex-1 justify-center px-8 space-x-1 lg:space-x-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) => cn(
                                        "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] lg:text-[11px] font-bold uppercase tracking-widest transition-all group",
                                        isActive
                                            ? "text-accent-primary"
                                            : "text-text-secondary hover:text-text-primary hover:bg-bg-card-alt"
                                    )}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive && "text-accent-primary")} />
                                            {item.label}
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="nav-active"
                                                    className="absolute inset-0 bg-accent-primary/10 border border-accent-primary/20 rounded-xl -z-10"
                                                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                                />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User Profile & Logout (Desktop) */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/profile" className="flex items-center gap-3 px-3 py-1.5 bg-bg-card-alt/50 border border-border-subtle/50 rounded-2xl hover:border-accent-primary/30 transition-all group">
                                <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20 flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                                    {user?.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user?.username} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <UserIcon className={cn("w-4 h-4 text-accent-primary", user?.avatar_url ? "hidden" : "flex")} />
                                </div>
                                <div className="flex flex-col justify-center min-w-0 pr-1">
                                    <span className="text-xs font-black truncate max-w-[100px]">{user?.username || user?.name || 'Explorer'}</span>
                                    <span className="text-[9px] text-accent-primary font-bold uppercase tracking-widest opacity-80">Sync Active</span>
                                </div>
                            </Link>
                            <button
                                onClick={onLogout}
                                className="flex items-center justify-center w-11 h-11 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 border border-rose-500/20 shadow-sm hover:shadow-rose-500/20"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-3 rounded-xl bg-bg-card-alt/80 border border-border-subtle/50 text-text-secondary hover:text-text-primary transition-all"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-border-subtle bg-bg-card/95 backdrop-blur-xl absolute w-full shadow-2xl overflow-hidden"
                        >
                            <nav className="px-4 py-6 space-y-2">
                                {navItems.map((item, idx) => (
                                    <motion.div
                                        key={item.to}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <NavLink
                                            to={item.to}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) => cn(
                                                "flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                                isActive
                                                    ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                                                    : "text-text-secondary hover:bg-bg-card-alt hover:text-text-primary"
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.label}
                                        </NavLink>
                                    </motion.div>
                                ))}
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between px-2 pb-2"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20 flex-shrink-0">
                                            <UserIcon className="w-6 h-6 text-accent-primary" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-black truncate max-w-[150px]">{user?.username || user?.name || 'Explorer'}</span>
                                            <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest">Premium Node</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            onLogout();
                                        }}
                                        className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </motion.div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="flex-1 w-full flex flex-col items-center">
                <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-8 lg:p-12">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};


