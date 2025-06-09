<?php
// app/Models/Keluarga.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;
use MatanYadaev\EloquentSpatial\Objects\Point;

class Keluarga extends Model
{
    use HasFactory, HasSpatial;

    protected $table = 'keluarga';

    protected $fillable = [
        'no_kk',
        'nama_kepala_keluarga',
        'alamat',
        'rt',
        'rw',
        'kelurahan',
        'kecamatan',
        'kota',
        'provinsi',
        'kode_pos',
        'status_ekonomi',
        'penghasilan_bulanan',
        'keterangan',
        'latitude',
        'longitude',
        'lokasi'
    ];

    protected $casts = [
        'penghasilan_bulanan' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'lokasi' => Point::class, // Spatial cast
    ];

    /**
     * Relationship: One to Many dengan AnggotaKeluarga
     * TAMBAHAN: Relationship yang hilang
     */
    public function anggota_keluarga(): HasMany
    {
        return $this->hasMany(AnggotaKeluarga::class, 'keluarga_id', 'id');
    }

    /**
     * Alternative method name (camelCase) untuk konsistensi
     */
    public function anggotaKeluarga(): HasMany
    {
        return $this->hasMany(AnggotaKeluarga::class, 'keluarga_id', 'id');
    }

    /**
     * Accessor untuk mendapatkan jumlah anggota keluarga
     */
    public function getJumlahAnggotaAttribute(): int
    {
        return $this->anggota_keluarga()->count();
    }

    /**
     * Override toArray untuk memastikan UTF-8 encoding pada string.
     */
    public function toArray()
    {
        $array = parent::toArray();

        // Sanitize string fields untuk UTF-8
        foreach ($array as $key => $value) {
            if (is_string($value)) {
                // Ensure proper UTF-8 encoding
                $array[$key] = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
                // Remove control characters
                $array[$key] = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $array[$key]);
            }
        }

        return $array;
    }

    /**
     * Override getAttribute untuk handle UTF-8.
     */
    public function getAttribute($key)
    {
        $value = parent::getAttribute($key);

        // Sanitize string attributes
        if (is_string($value) && in_array($key, [
            'nama_kepala_keluarga', 'alamat', 'kelurahan',
            'kecamatan', 'kota', 'provinsi', 'keterangan'
        ])) {
            $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
            $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
        }

        return $value;
    }

    /**
     * Scope untuk filter berdasarkan status ekonomi
     */
    public function scopeByStatusEkonomi($query, $status)
    {
        return $query->where('status_ekonomi', $status);
    }

    /**
     * Scope untuk filter berdasarkan kota
     */
    public function scopeByKota($query, $kota)
    {
        return $query->where('kota', $kota);
    }
}
