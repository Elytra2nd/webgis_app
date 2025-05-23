// resources/js/Layouts/AuthenticatedLayout.tsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Breadcrumb from '@/Components/Breadcrumb';
import { HiMenuAlt2 } from 'react-icons/hi';

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
        active?: boolean;
    }>;
}

export default function Authenticated({ user, header, children, breadcrumbs }: AuthenticatedProps) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-100/50 shadow-sm flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
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
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800">{user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Layout Container */}
            <div className="flex flex-1 min-h-0">
                {/* Sidebar - Fixed height dengan scrollable content */}
                <aside className={`bg-white border-r border-gray-100/50 shadow-sm ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col h-screen sticky top-0`}>
                    {/* Sidebar Header - Fixed */}
                    <div className="p-4 flex justify-between items-center border-b border-gray-100/50 flex-shrink-0">
                        {!sidebarCollapsed && (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
                                <h2 className="text-lg font-light text-gray-900">WebGIS</h2>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 rounded-lg hover:bg-cyan-50 text-gray-600 hover:text-cyan-600 transition-all duration-200"
                        >
                            <HiMenuAlt2 className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation Menu - Scrollable - HANYA MENU UTAMA */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <nav className="px-3 py-4 space-y-2">
                            <SidebarLink
                                href={route('dashboard')}
                                active={route().current('dashboard')}
                                icon="dashboard"
                                collapsed={sidebarCollapsed}
                            >
                                Dashboard
                            </SidebarLink>

                            <SidebarLink
                                href={route('keluarga.index')}
                                active={route().current('keluarga.*')}
                                icon="users"
                                collapsed={sidebarCollapsed}
                            >
                                Data Keluarga
                            </SidebarLink>

                            <SidebarLink
                                href={route('map')}
                                active={route().current('map')}
                                icon="map"
                                collapsed={sidebarCollapsed}
                            >
                                Peta Penduduk
                            </SidebarLink>

                            <SidebarLink
                                href={route('reports')}
                                active={route().current('reports')}
                                icon="reports"
                                collapsed={sidebarCollapsed}
                            >
                                Laporan
                            </SidebarLink>

                            <SidebarLink
                                href={route('settings')}
                                active={route().current('settings')}
                                icon="settings"
                                collapsed={sidebarCollapsed}
                            >
                                Pengaturan
                            </SidebarLink>

                            {/* HAPUS BAGIAN INI - Tambahan menu untuk testing scroll */}
                            {/*
                            <SidebarLink href="#" active={false} icon="dashboard" collapsed={sidebarCollapsed}>
                                Menu 1
                            </SidebarLink>
                            <SidebarLink href="#" active={false} icon="users" collapsed={sidebarCollapsed}>
                                Menu 2
                            </SidebarLink>
                            <SidebarLink href="#" active={false} icon="map" collapsed={sidebarCollapsed}>
                                Menu 3
                            </SidebarLink>
                            <SidebarLink href="#" active={false} icon="reports" collapsed={sidebarCollapsed}>
                                Menu 4
                            </SidebarLink>
                            <SidebarLink href="#" active={false} icon="settings" collapsed={sidebarCollapsed}>
                                Menu 5
                            </SidebarLink>
                            */}
                        </nav>
                    </div>

                    {/* Footer Info - Fixed */}
                    {!sidebarCollapsed && (
                        <div className="p-4 border-t border-gray-100/50 flex-shrink-0">
                            <div className="text-xs text-gray-500 text-center">
                                <p>WebGIS v1.0</p>
                                <p>© 2025</p>
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    {header && (
                        <header className="bg-white shadow-sm border-b border-gray-100/50 flex-shrink-0">
                            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                        </header>
                    )}

                    {/* Main Content with Breadcrumb */}
                    <main className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full overflow-y-auto">
                        {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

// Komponen SidebarLink yang diperbaiki
interface SidebarLinkProps {
    href: string;
    active: boolean;
    children: React.ReactNode;
    icon?: 'dashboard' | 'users' | 'settings' | 'reports' | 'map';
    collapsed: boolean;
}

function SidebarLink({ href, active, children, icon, collapsed }: SidebarLinkProps) {
    const iconMap = {
        dashboard: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
            </svg>
        ),
        users: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        map: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
        reports: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        settings: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    };

    return (
        <Link
            href={href}
            className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                    ? 'bg-gradient-to-r from-cyan-50 to-teal-50 text-cyan-700 border-r-2 border-cyan-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600'
            } ${collapsed ? 'justify-center' : ''}`}
        >
            <span className={`${collapsed ? '' : 'mr-3'} ${active ? 'text-cyan-600' : ''}`}>
                {icon && iconMap[icon]}
            </span>
            {!collapsed && <span>{children}</span>}
        </Link>
    );
}
