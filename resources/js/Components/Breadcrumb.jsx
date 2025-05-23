// resources/js/Components/Breadcrumb.jsx
import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label
 * @property {string} [href]
 * @property {boolean} [active]
 */

/**
 * @typedef {Object} BreadcrumbProps
 * @property {BreadcrumbItem[]} items
 */

/**
 * @param {BreadcrumbProps} props
 */
export default function Breadcrumb({ items }) {
    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        {index > 0 && (
                            <svg
                                className="w-4 h-4 text-gray-400 mx-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}

                        {item.href && !item.active ? (
                            <Link
                                href={item.href}
                                className="text-gray-500 hover:text-cyan-600 text-sm font-medium transition-colors duration-200"
                            >
                                {index === 0 && (
                                    <svg
                                        className="w-4 h-4 mr-2 inline"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                )}
                                {item.label}
                            </Link>
                        ) : (
                            <span className={`text-sm font-medium ${item.active ? 'text-cyan-600' : 'text-gray-400'}`}>
                                {index === 0 && (
                                    <svg
                                        className="w-4 h-4 mr-2 inline"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                )}
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
