import React, { FormEventHandler, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

// Shadcn UI Components
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';

// Lucide React Icons
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const loginContainerRef = useRef<HTMLDivElement>(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // PERBAIKAN: Sekarang useForm akan menerima LoginFormData tanpa error
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm ({
        email: '',
        password: '',
        remember: false as boolean,
    });

    // GSAP Animations
    useGSAP(() => {
        gsap.set('.login-card', { 
            opacity: 0, 
            scale: 0.9, 
            y: 50, 
            rotationX: -20 
        });
        gsap.set('.form-element', { 
            opacity: 0, 
            y: 20 
        });

        const tl = gsap.timeline({ 
            defaults: { ease: 'power3.out' }
        });
        
        tl.to('.login-card', {
            opacity: 1,
            scale: 1,
            y: 0,
            rotationX: 0,
            duration: 1,
        })
        .to('.form-element', {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
        }, "-=0.5");

        return () => tl.kill();
    }, { scope: loginContainerRef });

    // Enhanced submit handler dengan CSRF error handling
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Client-side validation
        if (!data.email || !data.password) {
            // Animate validation error
            gsap.to('.login-card', {
                keyframes: {
                    x: [-5, 5, -5, 5, 0]
                },
                duration: 0.4,
                ease: 'power2.out'
            });
            return;
        }

        setIsSubmitting(true);
        
        post(route('login'), {
            onFinish: () => {
                setData('password', '');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('Login errors:', errors);
                
                // Animate error state
                gsap.to('.login-card', {
                    keyframes: {
                        x: ['-=10', '+=20', '-=20', '+=20', 0]
                    },
                    duration: 0.5,
                    ease: 'power2.out'
                });
                
                // Handle CSRF error (419)
                if (Object.keys(errors).length === 0) {
                    console.warn('Possible CSRF token issue, refreshing page...');
                    
                    // Show user-friendly message
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
                    errorDiv.innerHTML = `
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                            Sesi telah berakhir. Halaman akan dimuat ulang...
                        </div>
                    `;
                    document.body.appendChild(errorDiv);
                    
                    setTimeout(() => {
                        if (document.body.contains(errorDiv)) {
                            document.body.removeChild(errorDiv);
                        }
                        window.location.reload();
                    }, 2000);
                }
                
                setIsSubmitting(false);
            },
            onSuccess: () => {
                // Animate success state
                gsap.to('.login-card', {
                    scale: 1.05,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => {
                        gsap.to('.login-card', {
                            opacity: 0,
                            scale: 0.9,
                            duration: 0.5
                        });
                    }
                });
            }
        });
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <GuestLayout showNavbar={false}>
            <Head title="Log in" />

            <div ref={loginContainerRef} className="flex items-center justify-center min-h-screen p-4">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-[pulse_8s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-[pulse_10s_cubic-bezier(0.4,0,0.6,1)_infinite_2s]"></div>
                </div>

                <Card 
                    className="login-card w-full max-w-md bg-white/60 backdrop-blur-xl border-slate-200/50 shadow-2xl shadow-cyan-500/10" 
                    style={{ transformStyle: 'preserve-3d' }}
                    role="main"
                    aria-labelledby="login-title"
                >
                    <CardHeader className="text-center p-8">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
                            <span className="font-semibold text-2xl tracking-wide text-slate-800">SiKeluarga</span>
                        </div>
                        <CardTitle id="login-title" className="text-3xl font-bold text-slate-900">
                            Selamat Datang
                        </CardTitle>
                        <CardDescription className="text-slate-600">
                            Masuk untuk melanjutkan ke dasbor admin Program Keluarga Harapan.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-8 pt-0">
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-700 bg-green-100 border border-green-200 p-3 rounded-lg flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {status}
                            </div>
                        )}
                        
                        <form onSubmit={submit} className="space-y-6" noValidate>
                            <fieldset disabled={processing || isSubmitting} className="space-y-6">
                                <div className="space-y-2 form-element">
                                    <Label htmlFor="email" className="text-slate-700 font-medium">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            className="pl-10 h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500 transition-colors duration-200"
                                            autoComplete="username"
                                            required
                                            placeholder="admin@example.com"
                                            onChange={(e) => setData('email', e.target.value)}
                                            aria-describedby={errors.email ? "email-error" : undefined}
                                            aria-invalid={errors.email ? 'true' : 'false'}
                                        />
                                    </div>
                                    <InputError message={errors.email} id="email-error" />
                                </div>

                                <div className="space-y-2 form-element">
                                    <Label htmlFor="password" className="text-slate-700 font-medium">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            className="pl-10 pr-10 h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500 transition-colors duration-200"
                                            autoComplete="current-password"
                                            required
                                            placeholder="••••••••"
                                            onChange={(e) => setData('password', e.target.value)}
                                            aria-describedby={errors.password ? "password-error" : undefined}
                                            aria-invalid={errors.password ? 'true' : 'false'}
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} id="password-error" />
                                </div>

                                <div className="flex items-center justify-between form-element">
                                    <div className="flex items-center">
                                        <Checkbox
                                            id="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                            className="border-slate-300"
                                        />
                                        <Label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600 cursor-pointer">
                                            Ingat saya
                                        </Label>
                                    </div>
                                    
                                    {canResetPassword && (
                                        <a
                                            href={route('password.request')}
                                            className="text-sm text-cyan-600 hover:text-cyan-800 font-medium transition-colors duration-200"
                                        >
                                            Lupa password?
                                        </a>
                                    )}
                                </div>

                                <div className="pt-4 form-element">
                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                                        disabled={processing || isSubmitting || !data.email || !data.password}
                                    >
                                        {processing || isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                Masuk ke Dashboard
                                                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </fieldset>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700 text-center">
                                🔒 Koneksi aman dengan enkripsi SSL. Data Anda terlindungi.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
