// resources/js/Components/Sidebar/Sidebar.jsx
import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { HiMenuAlt2, HiChevronDown } from 'react-icons/hi';

export default function Sidebar({ collapsed, setCollapsed }) {
    return (
        <div className={`bg-gray-800 text-white h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
            <div className="p-4 flex justify-between items-center">
                {!collapsed && <h2 className="text-xl font-semibold">Menu</h2>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded-md hover:bg-gray-700"
                >
                    <HiMenuAlt2 className="h-6 w-6" />
                </button>
            </div>
            <div className="mt-4">
                <SidebarLink
                    href={route('dashboard')}
                    active={route().current('dashboard')}
                    icon="dashboard"
                    collapsed={collapsed}
                >
                    Dashboard
                </SidebarLink>

                <SidebarSubmenu
                    title="Data Keluarga"
                    icon="users"
                    collapsed={collapsed}
                    active={route().current('keluarga.*')}
                >
                    <SidebarLink
                        href={route('keluarga.index')}
                        active={route().current('keluarga.index')}
                        collapsed={collapsed}
                        isSubmenuItem
                    >
                        Daftar Keluarga
                    </SidebarLink>
                    <SidebarLink
                        href={route('keluarga.create')}
                        active={route().current('keluarga.create')}
                        collapsed={collapsed}
                        isSubmenuItem
                    >
                        Tambah Keluarga
                    </SidebarLink>
                </SidebarSubmenu>

                {/* Tambahkan menu lain sesuai kebutuhan */}
            </div>
        </div>
    );
}

// Komponen SidebarLink
function SidebarLink({ href, active, children, icon, collapsed, isSubmenuItem = false }) {
    const iconMap = {
        dashboard: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
            </svg>
        ),
        users: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    };

    return (
        <Link
            href={href}
            className={`flex items-center ${isSubmenuItem ? 'pl-10' : 'px-4'} py-2 ${
                active ? 'bg-gray-700' : 'hover:bg-gray-700'
            } transition-colors duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
            {!isSubmenuItem && icon && <span className="mr-3">{iconMap[icon]}</span>}
            {(!collapsed || isSubmenuItem) && <span>{children}</span>}
        </Link>
    );
}

// Komponen SidebarSubmenu
function SidebarSubmenu({ title, icon, children, collapsed, active }) {
    const [isOpen, setIsOpen] = useState(active);

    const iconMap = {
        dashboard: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
            </svg>
        ),
        users: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    };

    if (collapsed) {
        return (
            <div className="relative group">
                <button
                    className={`flex items-center justify-center px-4 py-2 w-full ${
                        active ? 'bg-gray-700' : 'hover:bg-gray-700'
                    } transition-colors duration-200`}
                >
                    <span>{iconMap[icon]}</span>
                </button>

                {/* Popup menu for collapsed state */}
                <div className="absolute left-full top-0 z-10 w-48 bg-gray-800 shadow-lg rounded-md hidden group-hover:block">
                    <div className="py-2 px-4 border-b border-gray-700 font-medium">{title}</div>
                    <div className="py-2">{children}</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-4 py-2 w-full ${
                    active ? 'bg-gray-700' : 'hover:bg-gray-700'
                } transition-colors duration-200`}
            >
                <div className="flex items-center">
                    <span className="mr-3">{iconMap[icon]}</span>
                    <span>{title}</span>
                </div>
                <HiChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="bg-gray-900 py-2">{children}</div>
            )}
        </div>
    );
}
