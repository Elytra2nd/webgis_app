import React, { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { Toaster } from "@/Components/ui/toaster";
import { Button } from '@/Components/ui/button';
import { Home, Map, Database, LogIn } from 'lucide-react';

interface GuestLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}
export default function GuestLayout({ children, showNavbar = true }: GuestLayoutProps) {
  const navRef = useRef(null);

  useGSAP(() => {
    if (showNavbar && navRef.current) {
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2
      });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-white to-teal-50/50 text-slate-800">
      {showNavbar && (
        <nav ref={navRef} className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-4xl z-50">
          {/* Desain ulang navigasi agar modern, floating, dan menggunakan backdrop-blur */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200/80 mx-4">
            <div className="flex justify-between h-16 items-center px-6">
              {/* Logo Aplikasi */}
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-3 h-8 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full"></div>
                <span className="font-semibold text-lg tracking-wide text-slate-800">SiKeluarga</span>
              </Link>

              <div className="hidden space-x-8 sm:flex">
                <NavLink href={route('landing')} icon={<Home size={16} />}>
                  Beranda
                </NavLink>
                <NavLink href={route('map.public')} icon={<Map size={16} />}>
                  Peta
                </NavLink>
                <NavLink href={route('keluarga.index')} icon={<Database size={16} />}>
                  Data Keluarga
                </NavLink>
              </div>
              <div className="hidden sm:flex items-center">
                <Button asChild className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <Link href={route('login')}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className={showNavbar ? 'pt-28' : ''}>
        {children}
      </main>

      <Toaster />
    </div>
  );
}

// Komponen helper untuk NavLink agar kode lebih bersih
const NavLink = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Link
    href={href}
    className="inline-flex items-center space-x-2 px-1 pt-1 text-sm font-medium text-slate-600 hover:text-cyan-700 transition-colors duration-200 group relative"
  >
    {icon}
    <span>{children}</span>
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
  </Link>
);
