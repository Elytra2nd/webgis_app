<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Bantuan extends Model
{
    use HasFactory;

    protected $table = 'bantuan';
    
    protected $fillable = [
        'keluarga_id',
        'tahun_anggaran',
        'status',
        'nominal_per_bulan',
        'keterangan',
        'tanggal_penetapan'
    ];

    protected $casts = [
        'tanggal_penetapan' => 'datetime',
        'nominal_per_bulan' => 'decimal:2',
        'tahun_anggaran' => 'integer'
    ];

    // Relasi ke model Keluarga
    public function keluarga(): BelongsTo
    {
        return $this->belongsTo(Keluarga::class);
    }

    // Relasi ke model DistribusiBantuan
    public function distribusi(): HasMany
    {
        return $this->hasMany(DistribusiBantuan::class);
    }

    // Accessor untuk menghitung persentase distribusi
    public function getPersentaseDistribusiAttribute(): float
    {
        $totalBulan = 12;
        $bulanTerdistribusi = $this->distribusi()->where('status', 'disalurkan')->count();
        return $totalBulan > 0 ? ($bulanTerdistribusi / $totalBulan) * 100 : 0;
    }

    // Accessor untuk total nominal per tahun
    public function getTotalNominalTahunAttribute(): float
    {
        return $this->nominal_per_bulan * 12;
    }

    // Accessor untuk sisa bulan distribusi
    public function getSisaBulanDistribusiAttribute(): int
    {
        $bulanTerdistribusi = $this->distribusi()->where('status', 'disalurkan')->count();
        return 12 - $bulanTerdistribusi;
    }

    // Scope untuk filter berdasarkan tahun
    public function scopeByTahun($query, $tahun)
    {
        return $query->where('tahun_anggaran', $tahun);
    }

    // Scope untuk filter berdasarkan status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Scope untuk bantuan aktif
    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    // Method untuk mengaktifkan bantuan
    public function aktifkan()
    {
        $this->update(['status' => 'aktif']);
        
        // Buat distribusi untuk 12 bulan jika belum ada
        if ($this->distribusi()->count() === 0) {
            for ($bulan = 1; $bulan <= 12; $bulan++) {
                $this->distribusi()->create([
                    'bulan' => $bulan,
                    'status' => 'belum_disalurkan'
                ]);
            }
        }
    }

    // Method untuk menyelesaikan bantuan
    public function selesaikan()
    {
        $this->update(['status' => 'selesai']);
    }
}
