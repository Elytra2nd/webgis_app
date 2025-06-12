import React, { useState, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Toaster } from '@/Components/ui/toaster';
import { motion } from 'framer-motion';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Breadcrumb from '@/Components/Breadcrumb';
import {
    HiMenuAlt2,
    HiOutlineChartBar,
    HiOutlineCog,
    HiOutlineHome,
    HiOutlineMap,
    HiOutlineUsers,
    HiOutlineHeart,
    HiOutlineDocumentReport,
    HiOutlineUserGroup
} from 'react-icons/hi';

interface AuthenticatedProps {
    user: {
        name: string;
        email: string;
    };
    header?: React.ReactNode;
    children: React.ReactNode;
    breadcrumbs?: Array<{
        label: string;
        href?: string;
        current?: boolean;
    }>;
}

export default function Authenticated({ user, children, breadcrumbs }: AuthenticatedProps) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-50 flex flex-col">
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-sm flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {/* Placeholder untuk menyelaraskan dengan sidebar toggle */}
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white/80 hover:text-gray-700 hover:bg-white focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {user.name}
                                                <svg
                                                    className="ml-2 -mr-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.keluarga.index')} active={route().current('admin.keluarga.*')}>Data Keluarga</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('anggota-keluarga.index')} active={route().current('anggota-keluarga.*')}>Anggota Keluarga</ResponsiveNavLink>
                        {/* Menu Bantuan PKH untuk mobile */}
                        <ResponsiveNavLink href={route('admin.bantuan.index')} active={route().current('admin.bantuan.*')}>Bantuan PKH</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.bantuan.belum-menerima')} active={route().current('admin.bantuan.belum-menerima')}>KK Belum Terima</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.bantuan.peta')} active={route().current('admin.bantuan.peta')}>Peta Sebaran</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.map')} active={route().current('admin.map')}>Peta Penduduk</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.reports.index')} active={route().current('admin.reports.*')}>Laporan</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('admin.settings')} active={route().current('admin.settings')}>Pengaturan</ResponsiveNavLink>
                    </div>
                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800">{user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 min-h-0">
                <aside className={`bg-white/90 backdrop-blur-sm border-r border-gray-100/50 shadow-sm ${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex flex-col h-screen sticky top-0`}>
                    <div className="p-4 flex items-center border-b border-gray-100/50 flex-shrink-0" style={{ height: '4rem' }}>
                        {!sidebarCollapsed && (
                            <motion.div className="flex items-center space-x-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                <Link href="/" className="flex items-center space-x-3">
                                    <div className="w-3 h-8 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full"></div>
                                    <span className="font-semibold text-lg tracking-wide text-slate-800">SiKeluarga PKH</span>
                                </Link>
                            </motion.div>
                        )}
                        <motion.button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={`p-2 rounded-lg hover:bg-cyan-50 text-gray-600 hover:text-cyan-600 transition-all duration-200 ${sidebarCollapsed ? 'mx-auto' : 'ml-auto'}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <HiMenuAlt2 className="h-5 w-5" />
                        </motion.button>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <nav className="px-3 py-4 space-y-2">
                            {/* Menu utama */}
                            <SidebarLink href={route('dashboard')} active={route().current('dashboard')} icon={<HiOutlineHome />} collapsed={sidebarCollapsed}>Dashboard</SidebarLink>

                            {/* Data Keluarga */}
                            <SidebarLink href={route('admin.keluarga.index')} active={route().current('admin.keluarga.*')} icon={<HiOutlineUsers />} collapsed={sidebarCollapsed}>Data Keluarga</SidebarLink>
                            <SidebarLink href={route('anggota-keluarga.index')} active={route().current('anggota-keluarga.*')} icon={<HiOutlineUserGroup />} collapsed={sidebarCollapsed}>Anggota Keluarga</SidebarLink>

                            {/* Divider untuk Bantuan PKH */}
                            {!sidebarCollapsed && (
                                <div className="px-3 py-2">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Program Keluarga Harapan</div>
                                    <div className="mt-1 border-t border-slate-200"></div>
                                </div>
                            )}

                            {/* Menu Bantuan PKH */}
                            <SidebarLink href={route('admin.bantuan.index')} active={route().current('admin.bantuan.index')} icon={<HiOutlineHeart />} collapsed={sidebarCollapsed}>Bantuan PKH</SidebarLink>
                            <SidebarLink href={route('admin.bantuan.belum-menerima')} active={route().current('admin.bantuan.belum-menerima')} icon={<HiOutlineUsers />} collapsed={sidebarCollapsed}>KK Belum Terima</SidebarLink>
                            <SidebarLink href={route('admin.bantuan.peta')} active={route().current('admin.bantuan.peta')} icon={<HiOutlineMap />} collapsed={sidebarCollapsed}>Peta Sebaran</SidebarLink>

                            {/* Divider untuk menu lainnya */}
                            {!sidebarCollapsed && (
                                <div className="px-3 py-2">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sistem</div>
                                    <div className="mt-1 border-t border-slate-200"></div>
                                </div>
                            )}

                            {/* Menu sistem lainnya */}
                            <SidebarLink href={route('admin.map')} active={route().current('admin.map')} icon={<HiOutlineMap />} collapsed={sidebarCollapsed}>Peta Umum</SidebarLink>
                            <SidebarLink href={route('admin.reports.index')} active={route().current('admin.reports.index')} icon={<HiOutlineDocumentReport />} collapsed={sidebarCollapsed}>Laporan</SidebarLink>
                            <SidebarLink href={route('admin.settings')} active={route().current('admin.settings')} icon={<HiOutlineCog />} collapsed={sidebarCollapsed}>Pengaturan</SidebarLink>
                        </nav>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-w-0">
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100/50 flex-shrink-0">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                                <Breadcrumb items={breadcrumbs} />
                            </div>
                        </div>
                    )}
                    <main className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
            <Toaster />
        </div>
    );
}

interface SidebarLinkProps {
    href: string;
    active: boolean;
    children: React.ReactNode;
    icon: React.ReactNode;
    collapsed: boolean;
}

function SidebarLink({ href, active, children, icon, collapsed }: SidebarLinkProps) {
    return (
        <motion.div whileHover={{ x: collapsed ? 0 : 2 }} transition={{ type: "spring", stiffness: 300 }}>
            <Link
                href={href}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                        ? 'bg-gradient-to-r from-cyan-50 to-teal-50 text-cyan-700 border-l-4 border-cyan-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${collapsed ? 'justify-center' : ''}`}
            >
                <span className={`h-5 w-5 ${active ? 'text-cyan-600' : ''} flex-shrink-0`}>{icon}</span>
                {!collapsed && <span className="ml-3 truncate">{children}</span>}
            </Link>
        </motion.div>
    );
}
