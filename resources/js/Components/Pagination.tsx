import React from 'react';
import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

export default function Pagination({ links, className = '' }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className={`flex items-center justify-center space-x-1 ${className}`}>
            {links.map((link, index) => {
                if (link.url === null) {
                    return (
                        <span
                            key={index}
                            className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 ${
                            link.active
                                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-cyan-500 shadow-lg'
                                : 'text-gray-700 bg-white border-gray-200 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-300'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}
