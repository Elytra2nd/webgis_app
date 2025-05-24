// resources/js/Components/Sidebar/Sidebar.jsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { HiMenuAlt2, HiChevronDown } from 'react-icons/hi';

export default function Sidebar({ collapsed, setCollapsed }) {
    return (
        <div className={`bg-white border-r border-gray-100/50 h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 shadow-sm flex flex-col`}>
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b border-gray-100/50 flex-shrink-0">
                {!collapsed && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
                        <h2 className="text-lg font-light text-gray-900">WebGIS</h2>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-cyan-50 text-gray-600 hover:text-cyan-600 transition-all duration-200"
                >
                    <HiMenuAlt2 className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation Menu - Hanya menu utama */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-3 space-y-2">
                    <SidebarLink
                        href={route('dashboard')}
                        active={route().current('dashboard')}
                        icon="dashboard"
                        collapsed={collapsed}
                    >
                        Dashboard
                    </SidebarLink>

                    <SidebarLink
                        href={route('keluarga.index')}
                        active={route().current('keluarga.*')}
                        icon="users"
                        collapsed={collapsed}
                    >
                        Data Keluarga
                    </SidebarLink>

                    <SidebarLink
                        href={route('anggota-keluarga.index')}
                        active={route().current('anggota-keluarga.*')}
                        icon="users"
                        collapsed={collapsed}
                    >
                        Tambah Anggota Keluarga
                    </SidebarLink>

                    <SidebarLink
                        href={route('map')}
                        active={route().current('map')}
                        icon="map"
                        collapsed={collapsed}
                    >
                        Peta Penduduk
                    </SidebarLink>

                    <SidebarLink
                        href={route('reports.index')}
                        active={route().current('reports.*')}
                        icon="reports"
                        collapsed={collapsed}
                    >
                        Laporan
                    </SidebarLink>

                    <SidebarLink
                        href={route('settings')}
                        active={route().current('settings')}
                        icon="settings"
                        collapsed={collapsed}
                    >
                        Pengaturan
                    </SidebarLink>
                </nav>
            </div>

            {/* Footer Info */}
            {!collapsed && (
                <div className="p-4 border-t border-gray-100/50 flex-shrink-0">
                    <div className="text-xs text-gray-500 text-center">
                        <p>WebGIS v1.0</p>
                        <p>© 2025</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Komponen SidebarLink yang sudah diperbaiki
function SidebarLink({ href, active, children, icon, collapsed }) {
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
                {iconMap[icon]}
            </span>
            {!collapsed && <span>{children}</span>}
        </Link>
    );
}
