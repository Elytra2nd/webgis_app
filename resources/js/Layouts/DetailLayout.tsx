// resources/js/Layouts/DetailLayout.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';

interface DetailLayoutProps {
    user: {
        name: string;
        email: string;
    };
    header?: React.ReactNode;
    children: React.ReactNode;
}

export default function DetailLayout({ user, header, children }: DetailLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header Navigation */}
            <nav className="bg-white border-b border-gray-100/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800" />
                                <span className="ml-3 text-xl font-light text-gray-900">WebGIS</span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('keluarga.index')}
                                className="text-gray-600 hover:text-cyan-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                                Data Keluarga
                            </Link>

                            <Link
                                href={route('map')}
                                className="text-gray-600 hover:text-cyan-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                                Peta
                            </Link>

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
                    </div>
                </div>
            </nav>

            {/* Header */}
            {header && (
                <header className="bg-white shadow-sm border-b border-gray-100/50">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            {/* Main Content */}
            <main className="w-full">
                {children}
            </main>
        </div>
    );
}
