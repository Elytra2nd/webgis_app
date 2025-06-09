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
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login({ status }: { status?: string }) {
  // FIX 1: Pindahkan ref ke div pembungkus kartu login
  const loginContainerRef = useRef(null);

  const { data, setData, post, processing, errors, reset } = useForm<{
    email: string;
    password: string;
    remember: boolean;
  }>({
    email: '',
    password: '',
    remember: false,
  });

  // Animasi entri menggunakan GSAP dengan scope yang benar
  useGSAP(() => {
    // FIX 2: Gunakan ref pada container sebagai scope animasi
    const scope = loginContainerRef.current;

    // Targetkan kartu login dengan selector className
    gsap.set('.login-card', { opacity: 0, scale: 0.9, y: 50, rotationX: -20 });
    gsap.set('.form-element', { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }});
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
  }, { scope: loginContainerRef }); // Definisikan scope di sini

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <GuestLayout showNavbar={false}>
      <Head title="Log in" />

      {/* FIX 3: Tambahkan ref ke div pembungkus ini */}
      <div ref={loginContainerRef} className="flex items-center justify-center min-h-screen p-4">
        {/* Dekorasi Latar Belakang */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-[pulse_8s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-[pulse_10s_cubic-bezier(0.4,0,0.6,1)_infinite_2s]"></div>
        </div>

        {/* FIX 4: Hapus 'ref' dari Card, tambahkan className 'login-card' */}
        <Card className="login-card w-full max-w-md bg-white/60 backdrop-blur-xl border-slate-200/50 shadow-2xl shadow-cyan-500/10" style={{ transformStyle: 'preserve-3d' }}>
          <CardHeader className="text-center p-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full"></div>
              <span className="font-semibold text-2xl tracking-wide text-slate-800">SiKeluarga</span>
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">Selamat Datang</CardTitle>
            <CardDescription className="text-slate-600">Masuk untuk melanjutkan ke dasbor admin.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {status && (
              <div className="mb-4 text-sm font-medium text-green-700 bg-green-100 border border-green-200 p-3 rounded-lg">
                {status}
              </div>
            )}
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2 form-element">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    className="pl-10 h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                    autoComplete="username"
                    required
                    onChange={(e) => setData('email', e.target.value)}
                  />
                </div>
                <InputError message={errors.email} />
              </div>

              <div className="space-y-2 form-element">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    className="pl-10 h-11 border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                    autoComplete="current-password"
                    required
                    onChange={(e) => setData('password', e.target.value)}
                  />
                </div>
                <InputError message={errors.password} />
              </div>

              <div className="flex items-center form-element">
                <Checkbox
                  id="remember"
                  checked={data.remember}
                  onCheckedChange={(checked) => setData('remember', checked as boolean)}
                />
                <Label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600 cursor-pointer">
                  Ingat saya
                </Label>
              </div>

              <div className="pt-4 form-element">
                <Button type="submit" className="w-full h-12 text-base bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group" disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Log In <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </GuestLayout>
  );
}
