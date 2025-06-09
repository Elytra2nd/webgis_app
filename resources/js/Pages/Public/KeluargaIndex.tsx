import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { pickBy } from 'lodash';

// Shadcn UI Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { useToast } from "@/Hooks/use-toast";
import { Search, ListFilter, Download, X, Eye, Frown, Users, MapPin, Waves, Home, Filter, CheckCircle, ArrowLeft } from 'lucide-react';

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  // FIX 1: Update tipe data untuk mencakup 'rentan miskin' jika ada
  status_ekonomi: 'mampu' | 'kurang mampu' | 'rentan miskin' | 'sangat miskin';
  jumlah_anggota: number;
  rt?: string;
  rw?: string;
  kelurahan?: string;
}

interface PaginatedLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedData<T> {
  data: T[];
  links: PaginatedLink[];
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
  path: string;
}

interface Props {
  keluargas: PaginatedData<Keluarga>;
  filters: {
    search: string;
    status: string;
  };
}

const defaultKeluargasData: PaginatedData<Keluarga> = {
  data: [],
  links: [],
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0,
  path: '',
};

const defaultFiltersData = {
  search: '',
  status: '',
};

// --- React Component ---
export default function KeluargaIndex({
  keluargas = defaultKeluargasData,
  filters = defaultFiltersData
}: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');

  const { toast } = useToast();
  const mainContainerRef = useRef(null);
  const hasActiveFilters = search || status !== 'all';

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }});
    tl.from('.page-header', { opacity: 0, y: -30, duration: 0.8 })
      .from('.data-card', { opacity: 0, y: 20, duration: 0.6 }, "-=0.5");

    gsap.from('.table-row-item', {
      opacity: 0,
      x: -20,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out',
      delay: 0.5
    });
  }, { scope: mainContainerRef, dependencies: [keluargas?.current_page] });

  // Effect for filtering
  useEffect(() => {
    const params = pickBy({ search, status: status === 'all' ? '' : status });
    const timeoutId = setTimeout(() => {
      router.get(route('keluarga.index'), params, {
        preserveState: true,
        replace: true,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, status]);

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
  };

  const handleExportCsv = () => {
    toast({
      title: "Ekspor Berhasil",
      description: "Data keluarga sedang diunduh dalam format CSV.",
      action: (
        <div className="p-1 bg-green-500 rounded-full">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
      ),
    });
  };

  // FIX 2: Perbarui fungsi getStatusInfo dengan warna pembeda yang jelas
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'mampu':
        return { colorClass: 'bg-green-500', textClass: 'bg-green-100 text-green-800 border-green-200' };
      case 'kurang mampu':
      case 'rentan miskin': // Menangani kedua kemungkinan nilai
        return { colorClass: 'bg-yellow-500', textClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'sangat miskin':
        return { colorClass: 'bg-red-500', textClass: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { colorClass: 'bg-slate-500', textClass: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <TooltipProvider>
      <div ref={mainContainerRef} className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-white to-teal-50/50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <Head title="Data Keluarga" />

        <div className="max-w-7xl mx-auto relative z-10">
          <header className="page-header mb-8 flex items-center space-x-4">
            <div className="relative">
              <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 via-teal-500 to-blue-600 rounded-full shadow-lg"></div>
              <div className="absolute -top-1 -left-1 w-5 h-12 bg-gradient-to-b from-cyan-300/30 via-teal-400/30 to-blue-500/30 rounded-full blur-sm"></div>
            </div>
            <div className="flex items-center space-x-3">
              <Home className="w-8 h-8 text-teal-600" />
              <h1 className="font-semibold text-3xl text-slate-800 tracking-wide">Data Keluarga</h1>
            </div>
          </header>

          <Card className="data-card border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
            <CardHeader className="p-6 bg-gradient-to-r from-cyan-50/50 to-teal-50/50 border-b border-gray-100/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <CardTitle className="text-xl font-medium text-slate-800 flex items-center space-x-2">
                    <Waves className="w-5 h-5 text-teal-600" />
                    <span>Daftar Keluarga Publik</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Jelajahi data keluarga yang terdaftar dalam sistem.
                  </CardDescription>
                </div>
                <div className="sm:ml-auto flex w-full sm:w-auto gap-2">
                    {/* FIX 3: Tambahkan tombol kembali ke beranda */}
                    <Button asChild variant="outline" className="h-10 border-slate-300 hover:bg-slate-50">
                        <Link href={route('landing')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Beranda
                        </Link>
                    </Button>
                    <Button onClick={handleExportCsv} className="h-10 bg-cyan-600 hover:bg-cyan-700 shadow-sm">
                      <Download className="mr-2 h-4 w-4" />
                      Ekspor CSV
                    </Button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                    <Input
                      placeholder="Cari no KK, nama, atau alamat..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 h-10"
                    />
                  </div>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 h-10">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    {/* Animasi dropdown standar dari shadcn/ui */}
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="mampu">Mampu</SelectItem>
                      {/* FIX 4: Ubah label untuk mencerminkan permintaan pengguna */}
                      <SelectItem value="kurang mampu">Rentan Miskin</SelectItem>
                      <SelectItem value="sangat miskin">Sangat Miskin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                    <div className="flex items-center justify-between bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <Filter className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm font-medium text-cyan-700">Filter aktif:</span>
                            {search && (<Badge variant="secondary" className="bg-cyan-100 text-cyan-800">Pencarian: "{search}"</Badge>)}
                            {status !== 'all' && (<Badge variant="secondary" className="bg-cyan-100 text-cyan-800 capitalize">{status.replace('kurang mampu', 'rentan miskin')}</Badge>)}
                        </div>
                        <button onClick={resetFilters} className="text-cyan-600 hover:text-cyan-800 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">No. KK</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kepala Keluarga</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Alamat</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status Ekonomi</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm">
                    {keluargas?.data?.length > 0 ? (
                      keluargas.data.map((item) => {
                        const statusInfo = getStatusInfo(item.status_ekonomi);
                        return (
                          <TableRow key={item.id} className="table-row-item border-b border-slate-100 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-teal-50/30 transition-all duration-300">
                            <TableCell className="px-6 py-4"><span className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">{item.no_kk}</span></TableCell>
                            <TableCell className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-slate-900">{item.nama_kepala_keluarga}</div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="max-w-xs">
                                <div className="text-sm text-slate-900 truncate">{item.alamat}</div>
                                <div className="text-xs text-slate-500 truncate">{item.kecamatan}, {item.kota}</div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="secondary" className={`text-xs capitalize ${statusInfo.textClass}`}>
                                <span className={`mr-2 h-2 w-2 rounded-full ${statusInfo.colorClass}`}></span>
                                {item.status_ekonomi.replace('kurang mampu', 'rentan miskin')}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex justify-center space-x-1">
                                  <Tooltip><TooltipTrigger asChild>
                                      <Button asChild size="sm" variant="outline" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 text-xs px-2 py-1 transition-transform hover:scale-105 active:scale-95">
                                          <Link href={route('keluarga.show', item.id)}><Eye className="w-3 h-3" /></Link>
                                      </Button>
                                  </TooltipTrigger><TooltipContent><p>Lihat Detail</p></TooltipContent></Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center"><Home className="w-10 h-10 text-cyan-400" /></div>
                            <div className="text-center">
                              <p className="text-slate-500 font-medium text-lg">{hasActiveFilters ? 'Tidak ada data yang sesuai filter' : 'Belum ada data keluarga'}</p>
                              <p className="text-slate-400 text-sm mt-1">{hasActiveFilters ? 'Coba ubah kriteria pencarian Anda' : 'Data publik akan ditampilkan di sini'}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardContent>
            {keluargas?.data?.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50/50 to-cyan-50/50 border-t border-gray-100/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">Menampilkan <span className="font-semibold">{keluargas.data.length}</span> dari <span className="font-semibold">{keluargas.total}</span> keluarga</div>
                  <nav className="flex items-center space-x-2">
                    {keluargas.links.map((link, i) => (
                      <Button asChild={!!link.url} key={i} variant={link.active ? "default" : "outline"} size="sm" disabled={!link.url} className={`${link.active ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg' : 'border-slate-200 hover:bg-slate-50'} transition-transform hover:scale-105 active:scale-95`}>
                          {link.url ? (<Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />) : (<span dangerouslySetInnerHTML={{ __html: link.label }} />)}
                      </Button>
                    ))}
                  </nav>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
