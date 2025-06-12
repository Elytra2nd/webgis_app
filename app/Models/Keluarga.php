<?php
// app/Models/Keluarga.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'jumlah_anggota',
        'keterangan',
        'latitude',
        'longitude',
        'koordinat_updated_at',
        'lokasi',
        'status_verifikasi',
        'tanggal_verifikasi',
        'verifikator_id',
        'catatan_verifikasi',
        'is_active'
    ];

    protected $casts = [
        'penghasilan_bulanan' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'lokasi' => Point::class, // Spatial cast
        'koordinat_updated_at' => 'datetime',
        'tanggal_verifikasi' => 'datetime',
        'jumlah_anggota' => 'integer',
        'is_active' => 'boolean'
    ];

    // ========== RELATIONSHIPS ==========

    /**
     * Relationship: One to Many dengan AnggotaKeluarga
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
     * Relationship: One to Many dengan Bantuan
     */
    public function bantuan(): HasMany
    {
        return $this->hasMany(Bantuan::class);
    }

    /**
     * Relationship: One to One dengan bantuan aktif tahun ini
     */
    public function bantuanAktif(): HasOne
    {
        return $this->hasOne(Bantuan::class)
            ->where('tahun_anggaran', now()->year)
            ->whereIn('status', ['ditetapkan', 'aktif']);
    }

    /**
     * Relationship: Bantuan berdasarkan tahun tertentu
     */
    public function bantuanTahun($tahun): HasOne
    {
        return $this->hasOne(Bantuan::class)
            ->where('tahun_anggaran', $tahun);
    }

    /**
     * Relationship: Verifikator (User yang melakukan verifikasi)
     */
    public function verifikator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verifikator_id');
    }

    // ========== ACCESSORS ==========

    /**
     * Accessor untuk mendapatkan jumlah anggota keluarga dari relasi
     */
    public function getJumlahAnggotaDariRelasiAttribute(): int
    {
        return $this->anggota_keluarga()->count();
    }

    /**
     * Accessor untuk status ekonomi badge class (untuk UI)
     */
    public function getStatusEkonomiBadgeClassAttribute(): string
    {
        return match($this->status_ekonomi) {
            'sangat_miskin' => 'bg-red-100 text-red-800 border-red-200',
            'miskin' => 'bg-red-100 text-red-800 border-red-200',
            'rentan_miskin' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'kurang_mampu' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'mampu' => 'bg-green-100 text-green-800 border-green-200',
            default => 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }

    /**
     * Accessor untuk status verifikasi badge class (untuk UI)
     */
    public function getStatusVerifikasiBadgeClassAttribute(): string
    {
        return match($this->status_verifikasi) {
            'terverifikasi' => 'bg-green-100 text-green-800 border-green-200',
            'ditolak' => 'bg-red-100 text-red-800 border-red-200',
            default => 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
    }

    /**
     * Accessor untuk mengecek apakah memiliki koordinat
     */
    public function getHasCoordinatesAttribute(): bool
    {
        return !is_null($this->latitude) && !is_null($this->longitude);
    }

    /**
     * Accessor untuk alamat lengkap
     */
    public function getAlamatLengkapAttribute(): string
    {
        return trim("{$this->alamat}, RT {$this->rt}/RW {$this->rw}, {$this->kelurahan}, {$this->kecamatan}, {$this->kota}, {$this->provinsi}");
    }

    // ========== SCOPES ==========

    /**
     * Scope untuk keluarga yang belum menerima bantuan
     */
    public function scopeBelumMenerimaBantuan($query, $tahun = null)
    {
        $tahun = $tahun ?? now()->year;
        
        return $query->whereDoesntHave('bantuan', function ($q) use ($tahun) {
            $q->where('tahun_anggaran', $tahun)
              ->whereIn('status', ['ditetapkan', 'aktif']);
        });
    }

    /**
     * Scope untuk keluarga yang sudah menerima bantuan
     */
    public function scopeSudahMenerimaBantuan($query, $tahun = null)
    {
        $tahun = $tahun ?? now()->year;
        
        return $query->whereHas('bantuan', function ($q) use ($tahun) {
            $q->where('tahun_anggaran', $tahun)
              ->whereIn('status', ['ditetapkan', 'aktif']);
        });
    }

    /**
     * Scope untuk keluarga miskin (layak bantuan)
     */
    public function scopeLayakBantuan($query)
    {
        return $query->whereIn('status_ekonomi', ['sangat_miskin', 'miskin', 'rentan_miskin', 'kurang_mampu'])
                    ->where('status_verifikasi', 'terverifikasi')
                    ->where('is_active', true);
    }

    /**
     * Scope untuk keluarga yang sudah terverifikasi
     */
    public function scopeTerverifikasi($query)
    {
        return $query->where('status_verifikasi', 'terverifikasi');
    }

    /**
     * Scope untuk keluarga dengan koordinat
     */
    public function scopeWithCoordinates($query)
    {
        return $query->whereNotNull('latitude')
                    ->whereNotNull('longitude');
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

    /**
     * Scope untuk filter berdasarkan wilayah
     */
    public function scopeByWilayah($query, $kecamatan = null, $kelurahan = null)
    {
        if ($kecamatan) {
            $query->where('kecamatan', $kecamatan);
        }
        
        if ($kelurahan) {
            $query->where('kelurahan', $kelurahan);
        }
        
        return $query;
    }

    /**
     * Scope untuk keluarga aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // ========== METHODS ==========

    /**
     * Method untuk verifikasi keluarga
     */
    public function verifikasi($verifikatorId, $status = 'terverifikasi', $catatan = null)
    {
        $this->update([
            'status_verifikasi' => $status,
            'tanggal_verifikasi' => now(),
            'verifikator_id' => $verifikatorId,
            'catatan_verifikasi' => $catatan
        ]);

        // Log aktivitas
        LogAktivitas::log(
            'verifikasi_keluarga',
            'keluarga',
            $this->id,
            ['status_verifikasi' => $this->getOriginal('status_verifikasi')],
            ['status_verifikasi' => $status],
            "Verifikasi keluarga {$this->no_kk} - {$status}"
        );
    }

    /**
     * Method untuk update koordinat
     */
    public function updateCoordinates($latitude, $longitude)
    {
        $oldData = [
            'latitude' => $this->latitude,
            'longitude' => $this->longitude
        ];

        $this->update([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'koordinat_updated_at' => now(),
            'lokasi' => new Point($latitude, $longitude)
        ]);

        // Log aktivitas
        LogAktivitas::log(
            'update_koordinat',
            'keluarga',
            $this->id,
            $oldData,
            ['latitude' => $latitude, 'longitude' => $longitude],
            "Update koordinat keluarga {$this->no_kk}"
        );
    }

    /**
     * Method untuk mengecek kelayakan bantuan
     */
    public function isLayakBantuan(): bool
    {
        return in_array($this->status_ekonomi, ['sangat_miskin', 'miskin', 'rentan_miskin', 'kurang_mampu']) 
               && $this->status_verifikasi === 'terverifikasi'
               && $this->is_active;
    }

    /**
     * Method untuk mengecek apakah sudah menerima bantuan tahun ini
     */
    public function sudahMenerimaBantuanTahunIni(): bool
    {
        return $this->bantuanAktif()->exists();
    }

    /**
     * Method untuk nonaktifkan keluarga
     */
    public function nonaktifkan($alasan = null)
    {
        $this->update([
            'is_active' => false,
            'keterangan' => $this->keterangan . "\n[NONAKTIF] " . ($alasan ?? 'Dinonaktifkan pada ' . now()->format('d/m/Y H:i'))
        ]);
    }

    // ========== UTF-8 HANDLING ==========

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
            'kecamatan', 'kota', 'provinsi', 'keterangan', 'catatan_verifikasi'
        ])) {
            $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
            $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
        }

        return $value;
    }

    // ========== BOOT METHOD ==========

    /**
     * Boot method untuk auto-generate lokasi Point dari latitude/longitude
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            // Auto-generate Point dari latitude/longitude
            if ($model->latitude && $model->longitude) {
                $model->lokasi = new Point($model->latitude, $model->longitude);
            }

            // Auto-update jumlah_anggota jika tidak diset
            if (is_null($model->jumlah_anggota)) {
                $model->jumlah_anggota = $model->anggota_keluarga()->count() ?: 1;
            }
        });
    }
}
