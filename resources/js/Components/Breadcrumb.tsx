import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
    label: string;
    href?: string;
    current?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 py-2"
            >
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
                        )}
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center"
                        >
                            {item.current ? (
                                <span className="text-slate-700 font-medium px-2 py-1 rounded-md bg-slate-100/50" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href || '#'}
                                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all duration-200 flex items-center space-x-1 px-2 py-1 rounded-md"
                                >
                                    {index === 0 && <Home className="w-4 h-4" />}
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </motion.div>
                    </React.Fragment>
                ))}
            </motion.div>
        </nav>
    );
}
