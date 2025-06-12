<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class DistribusiBantuan extends Model
{
    use HasFactory;

    protected $table = 'distribusi_bantuan';
    
    protected $fillable = [
        'bantuan_id',
        'bulan',
        'status',
        'tanggal_distribusi',
        'catatan'
    ];

    protected $casts = [
        'tanggal_distribusi' => 'datetime',
        'bulan' => 'integer'
    ];

    // Relasi ke model Bantuan
    public function bantuan(): BelongsTo
    {
        return $this->belongsTo(Bantuan::class);
    }

    // Accessor untuk nama bulan
    public function getNamaBulanAttribute(): string
    {
        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret',
            4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September',
            10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        
        return $namaBulan[$this->bulan] ?? 'Unknown';
    }

    // Accessor untuk status badge class
    public function getStatusBadgeClassAttribute(): string
    {
        return match($this->status) {
            'disalurkan' => 'bg-green-100 text-green-800 border-green-200',
            'gagal' => 'bg-red-100 text-red-800 border-red-200',
            default => 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
    }

    // Scope untuk distribusi yang sudah disalurkan
    public function scopeDisalurkan($query)
    {
        return $query->where('status', 'disalurkan');
    }

    // Scope untuk distribusi yang belum disalurkan
    public function scopeBelumDisalurkan($query)
    {
        return $query->where('status', 'belum_disalurkan');
    }

    // Scope untuk filter berdasarkan bulan
    public function scopeByBulan($query, $bulan)
    {
        return $query->where('bulan', $bulan);
    }

    // Method untuk menandai sebagai disalurkan
    public function salurkan($catatan = null)
    {
        $this->update([
            'status' => 'disalurkan',
            'tanggal_distribusi' => now(),
            'catatan' => $catatan
        ]);
    }

    // Method untuk menandai sebagai gagal
    public function gagalkan($catatan = null)
    {
        $this->update([
            'status' => 'gagal',
            'catatan' => $catatan
        ]);
    }
}
