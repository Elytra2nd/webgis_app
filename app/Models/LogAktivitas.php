<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class LogAktivitas extends Model
{
    use HasFactory;

    protected $table = 'log_aktivitas';
    
    protected $fillable = [
        'user_id',
        'aksi',
        'tabel_target',
        'target_id',
        'data_lama',
        'data_baru',
        'ip_address',
        'keterangan'
    ];

    protected $casts = [
        'data_lama' => 'array',
        'data_baru' => 'array',
        'target_id' => 'integer'
    ];

    // Relasi ke model User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accessor untuk aksi badge class
    public function getAksiBadgeClassAttribute(): string
    {
        return match($this->aksi) {
            'penetapan_bantuan' => 'bg-green-100 text-green-800',
            'distribusi_bantuan' => 'bg-blue-100 text-blue-800',
            'update_koordinat' => 'bg-purple-100 text-purple-800',
            'verifikasi_keluarga' => 'bg-cyan-100 text-cyan-800',
            default => 'bg-slate-100 text-slate-800'
        };
    }

    // Scope untuk filter berdasarkan aksi
    public function scopeByAksi($query, $aksi)
    {
        return $query->where('aksi', $aksi);
    }

    // Scope untuk filter berdasarkan user
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Scope untuk filter berdasarkan tanggal
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    // Method static untuk log aktivitas
    public static function log($aksi, $tabelTarget, $targetId, $dataLama = null, $dataBaru = null, $keterangan = null)
    {
        return static::create([
            'user_id' => Auth::id(),
            'aksi' => $aksi,
            'tabel_target' => $tabelTarget,
            'target_id' => $targetId,
            'data_lama' => $dataLama,
            'data_baru' => $dataBaru,
            'ip_address' => request()->ip(),
            'keterangan' => $keterangan
        ]);
    }
}
