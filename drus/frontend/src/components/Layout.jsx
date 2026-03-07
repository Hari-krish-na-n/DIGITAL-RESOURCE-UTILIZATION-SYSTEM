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
    GraduationCap
} from 'lucide-react';
import { cn } from '../utils';

export const Layout = ({ user, onLogout }) => {
    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/repositories', icon: Folder, label: 'Repositories' },
        { to: '/courses', icon: GraduationCap, label: 'Courses' },
        { to: '/platforms', icon: Settings, label: 'Platforms' },
    ];

    return (
        <div className="flex h-screen bg-bg-main text-text-primary overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-bg-card border-r border-border-subtle flex flex-col hidden md:flex">
                <div className="p-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tight">DRUS</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all",
                                isActive
                                    ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                                    : "text-text-secondary hover:bg-bg-main hover:text-text-primary"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-border-subtle">
                    <div className="bg-bg-main/50 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center border border-accent-primary/30">
                                <UserIcon className="w-5 h-5 text-accent-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black truncate">{user?.username || user?.name || 'Guest'}</p>
                                <p className="text-[10px] text-text-secondary uppercase font-bold truncate opacity-50">Enterprise User</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
                        >
                            <LogOut className="w-3 h-3" />
                            Logout System
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 bg-bg-card border-b border-border-subtle flex items-center justify-between px-6 md:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <Activity className="text-accent-primary w-5 h-5" />
                        <span className="text-lg font-black tracking-tight">DRUS</span>
                    </Link>
                </header>

                <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
