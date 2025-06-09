import React, { useRef, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { TextPlugin } from 'gsap/TextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  Users,
  Home,
  MapPin,
  BarChart3,
  Eye,
  Search,
  TrendingUp,
  Shield,
  Globe,
  Activity,
  ArrowRight,
  ChevronDown,
  Waves,
  Droplets,
  Navigation,
  Sparkles,
  Heart,
  Star,
  Award,
  Clock,
  Zap,
  Target,
  CheckCircle,
  Database,
  Lock,
  Smartphone,
  Monitor,
  Cloud,
  Building,
  UserCheck,
  MapIcon,
  PieChart,
  BarChart2,
  TrendingDown,
  Calendar,
  FileText,
  Settings,
  Trophy,
  Crown,
  Medal,
  Anchor,
  Fish,
  Compass
} from 'lucide-react';

// Register GSAP plugins
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, TextPlugin, DrawSVGPlugin);

interface LandingPageProps {
  stats?: {
    total_keluarga: number;
    total_anggota: number;
    total_wilayah: number;
  };
  featured_regions?: Array<{
    kota: string;
    total: number;
  }>;
}

export default function LandingPage({ stats, featured_regions }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const regionsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Cursor Tracker Refs - Optimized
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const delayedMouse = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>();

  // State untuk fallback dan cursor
  const [animationsReady, setAnimationsReady] = useState(false);
  const [cursorHovered, setCursorHovered] = useState(false);

  // Enhanced Custom Cursor Tracker Animation - Optimized for responsiveness
  useEffect(() => {
    const manageMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouse.current = { x: clientX, y: clientY };

      // Immediate cursor update for better responsiveness
      if (cursorRef.current) {
        gsap.set(cursorRef.current, {
          x: clientX,
          y: clientY,
          xPercent: -50,
          yPercent: -50
        });
      }
    };

    const animate = () => {
      const dx = mouse.current.x - delayedMouse.current.x;
      const dy = mouse.current.y - delayedMouse.current.y;

      // Increased responsiveness
      delayedMouse.current.x += dx * 0.15;
      delayedMouse.current.y += dy * 0.15;

      if (cursorInnerRef.current) {
        gsap.set(cursorInnerRef.current, {
          x: delayedMouse.current.x,
          y: delayedMouse.current.y,
          xPercent: -50,
          yPercent: -50
        });
      }

      rafId.current = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => {
      setCursorHovered(true);
      if (cursorInnerRef.current) {
        gsap.to(cursorInnerRef.current, {
          scale: 1.2,
          duration: 0.2,
          ease: "power2.out"
        });
      }
    };

    const handleMouseLeave = () => {
      setCursorHovered(false);
      if (cursorInnerRef.current) {
        gsap.to(cursorInnerRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      }
    };

    // Enhanced click animation
    const handleMouseDown = () => {
      if (cursorInnerRef.current) {
        gsap.to(cursorInnerRef.current, {
          scale: 0.8,
          duration: 0.1,
          ease: 'power1.out'
        });
      }
    };

    const handleMouseUp = () => {
      if (cursorInnerRef.current) {
        gsap.to(cursorInnerRef.current, {
          scale: cursorHovered ? 1.2 : 1,
          duration: 0.15,
          ease: 'power2.out'
        });
      }
    };

    // Add event listeners
    window.addEventListener('mousemove', manageMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .stat-card, .feature-card, .region-item, .benefit-card, .testimonial-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    animate();

    return () => {
      window.removeEventListener('mousemove', manageMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [cursorHovered]);

  // Enhanced Card Hover Animations - Reduced scale for smaller cards
  useEffect(() => {
    if (!animationsReady) return;

    const cardSelectors = [
      '.stat-card',
      '.feature-card',
      '.benefit-card',
      '.testimonial-card',
      '.region-item'
    ];

    cardSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(card => {
        const handleMouseEnter = () => {
          gsap.to(card, {
            scale: 1.03,
            rotateZ: 0.5,
            y: -4,
            boxShadow: '0 12px 25px 0 rgba(6,182,212,0.15)',
            zIndex: 20,
            duration: 0.25,
            ease: 'power3.out'
          });
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            scale: 1,
            rotateZ: 0,
            y: 0,
            boxShadow: '0 4px 6px 0 rgba(0,0,0,0.1)',
            zIndex: 10,
            duration: 0.3,
            ease: 'power3.inOut'
          });
        };

        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
      });
    });

    return () => {
      cardSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(card => {
          card.removeEventListener('mouseenter', () => {});
          card.removeEventListener('mouseleave', () => {});
        });
      });
    };
  }, [animationsReady]);

  // GSAP Animations dengan ScrollSmoother yang diperbaiki
  useGSAP(() => {
    // Set initial states dengan proper cleanup
    gsap.set('.hero-title', { y: 100, opacity: 0 });
    gsap.set('.hero-subtitle', { y: 50, opacity: 0 });
    gsap.set('.hero-buttons', { y: 30, opacity: 0 });
    gsap.set('.floating-element', { scale: 0, rotation: 180 });
    gsap.set('.stat-card', { y: 60, opacity: 0, scale: 0.9 });
    gsap.set('.stat-icon', { scale: 0, rotation: 180 });
    gsap.set('.stat-number', { scale: 0.8, opacity: 0 });
    gsap.set('.region-item', { y: 80, opacity: 0, scale: 0.95 });
    gsap.set('.region-wave', { scale: 0, rotation: 45 });
    gsap.set('.region-rank', { scale: 0, rotation: 180 });
    gsap.set('.region-badge', { x: -30, opacity: 0 });
    gsap.set('.svg-line', { drawSVG: "0%" });

    // Hero Section Animation Timeline dengan proper spacing
    const heroTl = gsap.timeline({
      delay: 0.3,
      onComplete: () => setAnimationsReady(true)
    });

    heroTl
      .to('.hero-title', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
      })
      .to('.hero-subtitle', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.6')
      .to('.hero-buttons', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.4')
      .to('.floating-element', {
        scale: 1,
        rotation: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.3)',
        stagger: 0.15
      }, '-=0.8')
      .to('.svg-line', {
        drawSVG: "100%",
        duration: 1.5,
        ease: 'power2.inOut',
        stagger: 0.2
      }, '-=0.8');

    // Enhanced Floating animations for aquatic elements
    gsap.to('.wave-1', {
      y: -10,
      x: 8,
      rotation: 3,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });

    gsap.to('.wave-2', {
      y: -15,
      x: -6,
      rotation: -2,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });

    gsap.to('.droplet', {
      y: -8,
      scale: 1.05,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      stagger: 0.2
    });

    // Typing effect dengan proper timing
    gsap.to('.typing-text', {
      text: 'Platform terpadu untuk mengelola dan memantau data keluarga dengan teknologi modern dan antarmuka yang intuitif',
      duration: 2.5,
      ease: 'none',
      delay: 2
    });

    // Enhanced Stats Cards Animation dengan Icon Animation
    ScrollTrigger.create({
      trigger: statsRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        // Animate cards
        gsap.to('.stat-card', {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.4)',
          force3D: false
        });

        // Animate icons with bounce effect
        gsap.to('.stat-icon', {
          scale: 1,
          rotation: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.5)',
          delay: 0.2
        });

        // Animate numbers with scale effect
        gsap.to('.stat-number', {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          delay: 0.4
        });

        // SVG circle animation
        gsap.to('.stat-svg-circle', {
          drawSVG: "100%",
          duration: 1.5,
          delay: 0.3,
          ease: 'power2.inOut',
          stagger: 0.15
        });

        // Icon floating animation
        gsap.to('.stat-icon-float', {
          y: -3,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          stagger: 0.2,
          delay: 1
        });
      }
    });

    // Counter animation for stats dengan enhanced effect
    gsap.fromTo('.stat-number-counter',
      { textContent: 0 },
      {
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        textContent: (index: number, target: Element) => {
          return target.getAttribute('data-value') || 0;
        },
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        stagger: 0.2,
        delay: 0.5
      }
    );

    // Features Animation
    ScrollTrigger.create({
      trigger: featuresRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        gsap.from('.feature-card', {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          force3D: false
        });

        gsap.to('.feature-svg', {
          drawSVG: "100%",
          duration: 0.8,
          delay: 0.3,
          ease: 'power2.inOut',
          stagger: 0.08
        });
      }
    });

    // Benefits Animation
    ScrollTrigger.create({
      trigger: benefitsRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        gsap.from('.benefit-card', {
          y: 50,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out'
        });
      }
    });

    // Testimonials Animation
    ScrollTrigger.create({
      trigger: testimonialsRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        gsap.from('.testimonial-card', {
          scale: 0.9,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'back.out(1.4)'
        });
      }
    });

    // Enhanced Regions Animation dengan Aquatic Theme
    ScrollTrigger.create({
      trigger: regionsRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        // Staggered card entrance with wave effect
        gsap.to('.region-item', {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        });

        // Wave decorations
        gsap.to('.region-wave', {
          scale: 1,
          rotation: 0,
          duration: 1.2,
          stagger: 0.05,
          ease: 'elastic.out(1, 0.3)',
          delay: 0.2
        });

        // Rank badges with bounce
        gsap.to('.region-rank', {
          scale: 1,
          rotation: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'bounce.out',
          delay: 0.4
        });

        // Badge slide in
        gsap.to('.region-badge', {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power3.out',
          delay: 0.6
        });

        // Continuous floating animation for waves
        gsap.to('.region-wave-float', {
          y: -2,
          rotation: 2,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          stagger: 0.3,
          delay: 1
        });
      },
      onLeave: () => {
        // Reverse animation when scrolling down past section
        gsap.to('.region-item', {
          y: -20,
          opacity: 0.8,
          scale: 0.98,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.in'
        });
      },
      onEnterBack: () => {
        // Re-animate when scrolling back up
        gsap.to('.region-item', {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out'
        });
      },
      onLeaveBack: () => {
        // Animate out when scrolling up past section
        gsap.to('.region-item', {
          y: 30,
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.in'
        });
      }
    });

    // About Section Animation
    ScrollTrigger.create({
      trigger: aboutRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.about-content', {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      }
    });

    // Enhanced Parallax effects
    gsap.utils.toArray('.parallax-element').forEach((element: any) => {
      gsap.to(element, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    });

    // CTA Section Animation
    ScrollTrigger.create({
      trigger: ctaRef.current,
      start: 'top 80%',
      onEnter: () => {
        gsap.from('.cta-content', {
          scale: 0.95,
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out'
        });

        gsap.to('.cta-svg', {
          drawSVG: "100%",
          duration: 1.5,
          ease: 'power2.inOut',
          stagger: 0.15
        });
      }
    });

    // Enhanced Navbar scroll effect
    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      toggleClass: { className: 'nav-scrolled', targets: '.navbar' },
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.to('.navbar', {
          backdropFilter: `blur(${Math.min(progress * 15, 15)}px)`,
          backgroundColor: `rgba(255, 255, 255, ${Math.min(0.8 + progress * 0.2, 0.95)})`,
          duration: 0.2
        });
      }
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.killTweensOf('.stat-card');
      gsap.killTweensOf('.stat-number');
      gsap.killTweensOf('.stat-icon');
      gsap.killTweensOf('.region-item');
      gsap.killTweensOf('.region-wave');
      gsap.killTweensOf('.region-rank');
      gsap.killTweensOf('.region-badge');
      gsap.killTweensOf('.hero-title');
      gsap.killTweensOf('.hero-subtitle');
      gsap.killTweensOf('.hero-buttons');
      gsap.killTweensOf('.floating-element');
    };

  }, { scope: containerRef, dependencies: [stats, featured_regions] });

  const safeStats = {
    total_keluarga: stats?.total_keluarga || 0,
    total_anggota: stats?.total_anggota || 0,
    total_wilayah: stats?.total_wilayah || 0
  };

  const safeFeaturedRegions = Array.isArray(featured_regions) ? featured_regions.slice(0, 6) : [];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      <Head title="SiKeluarga - Sistem Informasi Keluarga Modern" />

      {/* Enhanced Custom Cursor Tracker - More visible */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-[9999] mix-blend-difference"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-full h-full bg-white rounded-full shadow-lg"></div>
      </div>

      <div
        ref={cursorInnerRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference transition-all duration-200 ${
          cursorHovered ? 'w-12 h-12 shadow-[0_0_0_6px_rgba(6,182,212,0.2)]' : 'w-3 h-3'
        }`}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-full h-full bg-white rounded-full opacity-60"></div>
      </div>

      {/* Enhanced Background Elements with Parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="parallax-element bg-element absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-cyan-200/12 to-teal-200/12 rounded-full blur-xl"></div>
        <div className="parallax-element bg-element absolute top-40 right-20 w-36 h-36 bg-gradient-to-br from-blue-200/8 to-cyan-200/8 rounded-full blur-2xl"></div>
        <div className="parallax-element bg-element absolute bottom-20 left-1/4 w-30 h-30 bg-gradient-to-br from-teal-200/12 to-emerald-200/12 rounded-full blur-xl"></div>
        <div className="parallax-element bg-element absolute top-1/2 right-1/4 w-18 h-18 bg-gradient-to-br from-indigo-200/8 to-cyan-200/8 rounded-full blur-lg"></div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="navbar fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-3 h-8 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
                <div className="absolute -top-1 -left-1 w-5 h-10 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
              </div>
              <span className="font-light text-xl text-slate-800 tracking-wide">SiKeluarga</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/map"
                className="text-slate-600 hover:text-cyan-600 transition-all duration-300 font-medium relative group"
              >
                Peta
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/keluarga/public"
                className="text-slate-600 hover:text-cyan-600 transition-all duration-300 font-medium relative group"
              >
                Data Keluarga
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Login Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section dengan Fixed Spacing */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        <div className="max-w-7xl mx-auto text-center relative z-10">

          {/* SVG Decorative Elements - Reduced Opacity */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 800">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08"/>
                <stop offset="50%" stopColor="#0891b2" stopOpacity="0.06"/>
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0.04"/>
              </linearGradient>
            </defs>
            <path className="svg-line" d="M0,400 Q300,200 600,400 T1200,400" stroke="url(#waveGradient)" strokeWidth="1" fill="none"/>
            <path className="svg-line" d="M0,450 Q400,250 800,450 T1200,450" stroke="url(#waveGradient)" strokeWidth="0.8" fill="none"/>
            <path className="svg-line" d="M0,500 Q200,300 400,500 T800,500" stroke="url(#waveGradient)" strokeWidth="0.5" fill="none"/>
          </svg>

          {/* Floating Elements - Reduced Size and Opacity */}
          <div className="floating-element wave-1 absolute -top-8 -left-8 w-12 h-12 bg-gradient-to-br from-cyan-400/6 via-teal-500/6 to-blue-600/6 rounded-full shadow-md"></div>
          <div className="floating-element wave-2 absolute top-16 right-16 w-16 h-16 bg-gradient-to-br from-blue-400/4 via-cyan-500/4 to-teal-600/4 rounded-full shadow-md"></div>
          <div className="floating-element droplet absolute -bottom-8 left-1/4 w-10 h-10 bg-gradient-to-br from-teal-400/8 to-cyan-500/8 rounded-full shadow-sm"></div>

          <div className="hero-title relative z-20 mb-8">
            <h1 className="font-semibold text-4xl md:text-6xl lg:text-7xl text-slate-800 tracking-wider leading-tight">
              Sistem Informasi
              <span className="block bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent font-semibold mt-4">
                Keluarga
              </span>
            </h1>
          </div>

          <div className="hero-subtitle max-w-4xl mx-auto mb-12 relative z-20">
            <div className="min-h-[5rem] flex items-center justify-center">
              <p className="typing-text text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed font-light text-center px-4"></p>
            </div>
          </div>

          <div className="hero-buttons flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 relative z-20">
            <Link href="/keluarga/public">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 hover:from-cyan-600 hover:via-teal-600 hover:to-blue-600 text-white shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 hover:scale-105 px-8 py-4">
                <Eye className="w-5 h-5 mr-3" />
                Lihat Data Keluarga
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline" className="border-2 border-cyan-200 text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:border-cyan-300 transition-all duration-300 hover:scale-105 px-8 py-4">
                <Navigation className="w-5 h-5 mr-3" />
                Jelajahi Peta
              </Button>
            </Link>
          </div>

          <div className="animate-bounce relative z-20">
            <ChevronDown className="w-8 h-8 text-slate-400 mx-auto" />
          </div>
        </div>
      </section>

      {/* Enhanced Statistics Section dengan Icon Shadcn UI */}
      <section ref={statsRef} className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 px-4 py-2 mb-6">
              <BarChart3 className="w-4 h-4 mr-2" />
              Data Terkini
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-slate-800 mb-6 tracking-wide">Statistik Keluarga</h2>
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-3xl mx-auto">Data real-time yang terdaftar dalam sistem dengan visualisasi interaktif</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                label: 'Total Keluarga',
                value: safeStats.total_keluarga,
                icon: Home,
                gradient: 'from-cyan-500 to-blue-500',
                bgGradient: 'from-cyan-50 to-blue-50',
                iconBg: 'bg-cyan-100',
                iconColor: 'text-cyan-600',
                description: 'Keluarga terdaftar'
              },
              {
                label: 'Total Anggota',
                value: safeStats.total_anggota,
                icon: Users,
                gradient: 'from-teal-500 to-cyan-500',
                bgGradient: 'from-teal-50 to-cyan-50',
                iconBg: 'bg-teal-100',
                iconColor: 'text-teal-600',
                description: 'Anggota keluarga'
              },
              {
                label: 'Wilayah Terdaftar',
                value: safeStats.total_wilayah,
                icon: MapPin,
                gradient: 'from-blue-500 to-indigo-500',
                bgGradient: 'from-blue-50 to-indigo-50',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                description: 'Area cakupan'
              }
            ].map((stat, index) => (
              <Card
                key={stat.label}
                className={`stat-card border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-cyan-500/10 transition-all duration-500 group overflow-hidden relative ${
                  !animationsReady ? 'animate-fade-in-up' : ''
                }`}
                style={!animationsReady ? { animationDelay: `${index * 0.15}s` } : {}}
              >
                <CardContent className="p-6 lg:p-8 text-center h-full flex flex-col justify-center relative">
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-30`}></div>

                  {/* Icon Container dengan Animasi */}
                  <div className={`stat-icon stat-icon-float relative z-10 w-16 h-16 lg:w-20 lg:h-20 ${stat.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <stat.icon className={`stat-icon w-8 h-8 lg:w-10 lg:h-10 ${stat.iconColor}`} />

                    {/* SVG Circle Animation */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                      <circle
                        className="stat-svg-circle"
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="url(#statGradient)"
                        strokeWidth="2"
                        strokeDasharray="226"
                        strokeDashoffset="226"
                        opacity="0.6"
                      />
                      <defs>
                        <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4"/>
                          <stop offset="100%" stopColor="#3b82f6"/>
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Pulse Effect */}
                    <div className={`absolute inset-0 ${stat.iconBg} rounded-2xl animate-ping opacity-20`}></div>
                  </div>

                  {/* Number dengan Counter Animation */}
                  <div className="stat-number relative z-10 mb-3">
                    <h3
                      className={`stat-number-counter text-3xl lg:text-4xl xl:text-5xl font-extralight bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                      data-value={stat.value}
                    >
                      {animationsReady ? '0' : stat.value.toLocaleString()}
                    </h3>
                  </div>

                  {/* Label dan Description */}
                  <div className="relative z-10">
                    <p className="text-slate-800 font-semibold text-base lg:text-lg mb-1">{stat.label}</p>
                    <p className="text-slate-500 text-sm">{stat.description}</p>
                  </div>

                  {/* Trend Indicator */}
                  <div className="relative z-10 mt-3 flex items-center justify-center">
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-medium">+12% bulan ini</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              {
                icon: Building,
                label: 'Desa/Kelurahan',
                value: '156',
                color: 'text-emerald-600',
                bg: 'bg-emerald-100'
              },
              {
                icon: UserCheck,
                label: 'Kepala Keluarga',
                value: safeStats.total_keluarga.toLocaleString(),
                color: 'text-purple-600',
                bg: 'bg-purple-100'
              },
              {
                icon: Calendar,
                label: 'Data Terupdate',
                value: 'Hari ini',
                color: 'text-orange-600',
                bg: 'bg-orange-100'
              },
              {
                icon: FileText,
                label: 'Laporan Aktif',
                value: '24',
                color: 'text-rose-600',
                bg: 'bg-rose-100'
              }
            ].map((item, index) => (
              <Card key={item.label} className="border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-4 text-center">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-lg font-semibold text-slate-800">{item.value}</p>
                  <p className="text-xs text-slate-600">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section - Smaller Cards */}
      <section ref={featuresRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50/50 via-cyan-50/30 to-teal-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Fitur Unggulan
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-slate-800 mb-6 tracking-wide">Kemudahan Akses Informasi</h2>
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-3xl mx-auto">Teknologi modern untuk masyarakat digital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: 'Pencarian Cerdas',
                description: 'AI-powered search untuk hasil yang akurat dan relevan',
                gradient: 'from-cyan-500 to-blue-500'
              },
              {
                icon: Navigation,
                title: 'Peta Interaktif',
                description: 'Visualisasi 3D lokasi keluarga dengan teknologi WebGL',
                gradient: 'from-teal-500 to-cyan-500'
              },
              {
                icon: BarChart3,
                title: 'Analytics Real-time',
                description: 'Dashboard analytics dengan update data secara real-time',
                gradient: 'from-blue-500 to-indigo-500'
              },
              {
                icon: Shield,
                title: 'Keamanan Tingkat Tinggi',
                description: 'Enkripsi end-to-end dan compliance GDPR',
                gradient: 'from-indigo-500 to-purple-500'
              }
            ].map((feature, index) => (
              <Card key={feature.title} className="feature-card border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 relative`}>
                    <feature.icon className="w-6 h-6 text-white" />
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 48 48">
                      <rect
                        className="feature-svg"
                        x="2"
                        y="2"
                        width="44"
                        height="44"
                        rx="8"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1.5"
                        strokeDasharray="150"
                        strokeDashoffset="150"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Smaller Cards */}
      <section ref={benefitsRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-4 py-2 mb-6">
              <Target className="w-4 h-4 mr-2" />
              Manfaat Utama
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-slate-800 mb-6 tracking-wide">Mengapa Memilih SiKeluarga?</h2>
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-3xl mx-auto">Solusi terdepan untuk pengelolaan data keluarga yang efisien dan terpercaya</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Performa Tinggi',
                description: 'Akses data dengan kecepatan tinggi dan responsif di semua perangkat',
                color: 'text-yellow-600',
                bg: 'bg-yellow-50'
              },
              {
                icon: Database,
                title: 'Data Terpusat',
                description: 'Semua informasi keluarga tersimpan dalam satu sistem yang terintegrasi',
                color: 'text-blue-600',
                bg: 'bg-blue-50'
              },
              {
                icon: Lock,
                title: 'Keamanan Terjamin',
                description: 'Enkripsi tingkat militer melindungi privasi data keluarga Anda',
                color: 'text-red-600',
                bg: 'bg-red-50'
              },
              {
                icon: Smartphone,
                title: 'Mobile Friendly',
                description: 'Akses mudah melalui smartphone, tablet, atau desktop kapan saja',
                color: 'text-green-600',
                bg: 'bg-green-50'
              },
              {
                icon: Clock,
                title: 'Real-time Update',
                description: 'Data selalu ter-update secara real-time untuk informasi terkini',
                color: 'text-purple-600',
                bg: 'bg-purple-50'
              },
              {
                icon: Cloud,
                title: 'Cloud Storage',
                description: 'Backup otomatis ke cloud untuk memastikan data tidak hilang',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50'
              }
            ].map((benefit, index) => (
              <Card key={benefit.title} className="benefit-card border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${benefit.bg} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Smaller Cards */}
      <section ref={testimonialsRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50/50 via-cyan-50/30 to-teal-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 px-4 py-2 mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Testimoni Pengguna
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-slate-800 mb-6 tracking-wide">Apa Kata Mereka?</h2>
            <p className="text-lg md:text-xl text-slate-600 font-light max-w-3xl mx-auto">Pengalaman nyata dari pengguna SiKeluarga di seluruh Indonesia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Budi Santoso',
                role: 'Kepala Desa Sukamaju',
                content: 'SiKeluarga sangat membantu dalam mengelola data penduduk desa. Interface yang mudah digunakan dan data yang akurat.',
                rating: 5,
                avatar: 'BS'
              },
              {
                name: 'Siti Nurhaliza',
                role: 'Petugas Kelurahan',
                content: 'Sistem yang sangat efisien! Sekarang proses pendataan keluarga menjadi lebih cepat dan terorganisir dengan baik.',
                rating: 5,
                avatar: 'SN'
              },
              {
                name: 'Ahmad Rahman',
                role: 'Koordinator RT',
                content: 'Fitur peta interaktif sangat membantu dalam memvisualisasikan persebaran keluarga di wilayah kami.',
                rating: 5,
                avatar: 'AR'
              }
            ].map((testimonial, index) => (
              <Card key={testimonial.name} className="testimonial-card border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{testimonial.name}</h4>
                      <p className="text-slate-600 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic leading-relaxed text-sm">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Regions dengan Aquatic Theme */}
      {safeFeaturedRegions.length > 0 && (
        <section ref={regionsRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative z-10 overflow-hidden">
          {/* Aquatic Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-cyan-100/20 to-teal-100/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-100/15 to-cyan-100/15 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-teal-100/25 to-emerald-100/25 rounded-full blur-xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 px-4 py-2 mb-6">
                <Trophy className="w-4 h-4 mr-2" />
                Wilayah Terpopuler
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-slate-800 mb-6 tracking-wide">Daerah Terdepan</h2>
              <p className="text-lg md:text-xl text-slate-600 font-light max-w-3xl mx-auto">Wilayah dengan partisipasi tertinggi dalam sistem SiKeluarga</p>

              {/* Decorative Wave SVG */}
              <svg className="mx-auto mt-8 opacity-20" width="200" height="40" viewBox="0 0 200 40">
                <path d="M0,20 Q50,0 100,20 T200,20" stroke="url(#waveGradient2)" strokeWidth="2" fill="none"/>
                <defs>
                  <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4"/>
                    <stop offset="50%" stopColor="#0891b2"/>
                    <stop offset="100%" stopColor="#0e7490"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeFeaturedRegions.map((region, index) => (
                <div key={region.kota} className="region-item">
                  <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                    {/* Aquatic Wave Decoration */}
                    <div className="region-wave region-wave-float absolute -top-2 -right-2 w-16 h-16 opacity-10">
                      <svg viewBox="0 0 64 64" className="w-full h-full">
                        <path d="M0,32 Q16,16 32,32 T64,32 L64,64 L0,64 Z" fill="url(#cardWaveGradient)"/>
                        <defs>
                          <linearGradient id="cardWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4"/>
                            <stop offset="100%" stopColor="#0891b2"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Floating Droplets */}
                    <div className="absolute top-4 right-4">
                      <div className="region-wave w-2 h-2 bg-cyan-200 rounded-full opacity-40"></div>
                      <div className="region-wave w-1 h-1 bg-teal-300 rounded-full opacity-60 mt-1 ml-2"></div>
                    </div>

                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {/* Enhanced Rank Badge dengan Aquatic Theme */}
                          <div className={`region-rank w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 relative ${
                            index < 3
                              ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3'
                              : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 group-hover:bg-gradient-to-br group-hover:from-slate-200 group-hover:to-slate-300'
                          }`}>
                            {index < 3 ? (
                              <>
                                {index === 0 && <Crown className="w-5 h-5" />}
                                {index === 1 && <Medal className="w-5 h-5" />}
                                {index === 2 && <Trophy className="w-5 h-5" />}
                                {/* Glow Effect untuk Top 3 */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 to-teal-400/30 rounded-2xl animate-pulse"></div>
                              </>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>

                          <div>
                            <h3 className="font-semibold text-slate-800 text-base group-hover:text-cyan-700 transition-colors duration-300">{region.kota}</h3>
                            <div className="flex items-center space-x-1 text-slate-500 text-xs">
                              <MapPin className="w-3 h-3" />
                              <span>Kota/Kabupaten</span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Badge dengan Wave Effect */}
                        <div className="region-badge relative">
                          <Badge variant="secondary" className="bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-800 px-3 py-1 text-xs font-medium shadow-sm">
                            <Waves className="w-3 h-3 mr-1" />
                            {region.total} keluarga
                          </Badge>

                          {/* Ripple Effect untuk Top 3 */}
                          {index < 3 && (
                            <div className="absolute inset-0 bg-cyan-200 rounded-full animate-ping opacity-20"></div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar dengan Aquatic Theme */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-600">Tingkat Partisipasi</span>
                          <span className="text-xs font-medium text-cyan-600">
                            {Math.min(100, Math.round((region.total / Math.max(...safeFeaturedRegions.map(r => r.total))) * 100))}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-1000 ease-out relative"
                            style={{
                              width: `${Math.min(100, Math.round((region.total / Math.max(...safeFeaturedRegions.map(r => r.total))) * 100))}%`
                            }}
                          >
                            {/* Wave effect inside progress bar */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 to-teal-400/50 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* Aquatic Statistics */}
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Droplets className="w-3 h-3 text-cyan-500" />
                            <span>Tingkat Aktivitas</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Aktif</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Enhanced Call to Action dengan Aquatic Elements */}
            <div className="text-center mt-16 relative">
              {/* Decorative Wave Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg width="400" height="100" viewBox="0 0 400 100" className="opacity-10">
                  <path d="M0,50 Q100,20 200,50 T400,50" stroke="url(#actionWaveGradient)" strokeWidth="2" fill="none"/>
                  <path d="M0,60 Q100,30 200,60 T400,60" stroke="url(#actionWaveGradient)" strokeWidth="1.5" fill="none"/>
                  <defs>
                    <linearGradient id="actionWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4"/>
                      <stop offset="50%" stopColor="#0891b2"/>
                      <stop offset="100%" stopColor="#0e7490"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-light text-slate-800 mb-4">Jelajahi Lebih Dalam</h3>
                <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                  Temukan data keluarga lengkap dari seluruh wilayah Indonesia dengan teknologi pencarian yang canggih dan visualisasi yang menarik.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/keluarga/public">
                    <Button className="bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 hover:from-cyan-600 hover:via-teal-600 hover:to-blue-600 text-white shadow-xl hover:shadow-cyan-500/25 transition-all duration-500 hover:scale-105 px-8 py-3 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Search className="w-5 h-5 mr-3 relative z-10" />
                      <span className="relative z-10">Lihat Semua Data</span>
                      <ArrowRight className="w-5 h-5 ml-3 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>

                  <Link href="/map">
                    <Button variant="outline" className="border-2 border-cyan-200 text-cyan-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:border-cyan-300 transition-all duration-300 hover:scale-105 px-8 py-3 relative group">
                      <Compass className="w-5 h-5 mr-3 group-hover:rotate-45 transition-transform duration-300" />
                      <span>Jelajahi Peta</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section - Smaller Cards */}
      <section ref={aboutRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50/50 via-cyan-50/30 to-teal-50/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="about-content">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2 mb-6">
                <Award className="w-4 h-4 mr-2" />
                Tentang SiKeluarga
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extralight text-slate-800 mb-6 tracking-wide">Inovasi Digital untuk Masa Depan</h2>
              <p className="text-lg text-slate-600 font-light leading-relaxed mb-6">
                SiKeluarga hadir sebagai solusi digital terdepan untuk mengelola data keluarga dengan pendekatan yang modern, aman, dan user-friendly. Kami berkomitmen untuk memberikan layanan terbaik dalam digitalisasi data kependudukan.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-light text-cyan-600 mb-1">99.9%</div>
                  <div className="text-slate-600 text-sm">Uptime Server</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-teal-600 mb-1">24/7</div>
                  <div className="text-slate-600 text-sm">Support</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mulai Sekarang
                </Button>
                <Button variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  <Monitor className="w-4 h-4 mr-2" />
                  Lihat Demo
                </Button>
              </div>
            </div>
            <div className="about-content">
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl p-6 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <Database className="w-6 h-6 text-cyan-600 mb-3" />
                      <h4 className="font-semibold text-slate-800 mb-1 text-sm">Data Terpusat</h4>
                      <p className="text-slate-600 text-xs">Sistem database yang terintegrasi dan aman</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <Shield className="w-6 h-6 text-teal-600 mb-3" />
                      <h4 className="font-semibold text-slate-800 mb-1 text-sm">Keamanan Tinggi</h4>
                      <p className="text-slate-600 text-xs">Enkripsi end-to-end untuk melindungi data</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <Smartphone className="w-6 h-6 text-blue-600 mb-3" />
                      <h4 className="font-semibold text-slate-800 mb-1 text-sm">Mobile Ready</h4>
                      <p className="text-slate-600 text-xs">Akses mudah dari perangkat mobile</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                      <Cloud className="w-6 h-6 text-indigo-600 mb-3" />
                      <h4 className="font-semibold text-slate-800 mb-1 text-sm">Cloud Based</h4>
                      <p className="text-slate-600 text-xs">Infrastruktur cloud yang scalable</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-600 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/90 to-teal-600/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-8 left-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-8 right-8 w-36 h-36 bg-white/3 rounded-full blur-2xl"></div>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 400">
          <defs>
            <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0.04)"/>
            </linearGradient>
          </defs>
          <path className="cta-svg" d="M0,200 Q300,100 600,200 T1200,200" stroke="url(#ctaGradient)" strokeWidth="1.5" fill="none"/>
          <path className="cta-svg" d="M0,250 Q400,150 800,250 T1200,250" stroke="url(#ctaGradient)" strokeWidth="1" fill="none"/>
        </svg>

        <div className="cta-content max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-white mb-6 tracking-wide">
            Mulai Jelajahi Data Keluarga
          </h2>
          <p className="text-lg md:text-xl text-cyan-100 mb-10 font-light leading-relaxed max-w-3xl mx-auto">
            Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan SiKeluarga dalam mengelola data keluarga
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/keluarga/public">
              <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-cyan-50 shadow-2xl hover:shadow-white/25 transition-all duration-500 hover:scale-105 px-8 py-4">
                <Search className="w-5 h-5 mr-3" />
                Cari Data Keluarga
              </Button>
            </Link>
            <Link href="/map">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 hover:border-cyan-200 transition-all duration-300 hover:scale-105 px-8 py-4">
                <Globe className="w-5 h-5 mr-3" />
                Lihat Peta Wilayah
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="w-3 h-8 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
                  <div className="absolute -top-1 -left-1 w-5 h-10 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
                </div>
                <span className="font-light text-2xl tracking-wide">SiKeluarga</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                Sistem informasi keluarga yang modern dan terpercaya untuk kemudahan akses data masyarakat dengan teknologi terdepan dan keamanan tingkat tinggi.
              </p>
              <div className="flex space-x-4">
                <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                  <Activity className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
                <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                  <Shield className="w-3 h-3 mr-1" />
                  Secure
                </Badge>
                <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                  <Cloud className="w-3 h-3 mr-1" />
                  Cloud-based
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Fitur</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/keluarga/public" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Data Keluarga</Link></li>
                <li><Link href="/map" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Peta Interaktif</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Statistik Real-time</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Analytics Dashboard</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Export Data</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Dukungan</h3>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/login" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Login Admin</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Daftar</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Dokumentasi</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block">Kontak</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="my-12 bg-slate-700" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; 2025 SiKeluarga. Semua hak dilindungi undang-undang. Dibuat dengan ❤️ untuk Indonesia.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                <Waves className="w-3 h-3 mr-1" />
                Aquatic Theme
              </Badge>
              <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                v2.0.0
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
