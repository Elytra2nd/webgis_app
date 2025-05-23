<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

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
        'lokasi',
        'status_ekonomi',
        'penghasilan_bulanan',
        'keterangan'
    ];

    protected $casts = [
        'lokasi' => Point::class,
    ];

    // Method boot untuk menangani field kosong
    public static function boot()
    {
        parent::boot();

        static::saving(function($model) {
            // Field yang boleh kosong diset ke null jika empty
            $nullableFields = ['rt', 'rw', 'kelurahan', 'kecamatan', 'kota', 'provinsi', 'kode_pos', 'penghasilan_bulanan', 'keterangan'];

            foreach ($nullableFields as $field) {
                if (empty($model->{$field})) {
                    $model->{$field} = null;
                }
            }
        });
    }

    public function anggotaKeluarga(): HasMany
    {
        return $this->hasMany(AnggotaKeluarga::class);
    }

    public function wilayah(): HasMany
    {
        return $this->hasMany(Wilayah::class);
    }

    public function jarak(): HasMany
    {
        return $this->hasMany(Jarak::class);
    }
}
