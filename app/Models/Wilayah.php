<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MatanYadaev\EloquentSpatial\Objects\Polygon;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Wilayah extends Model
{
    use HasFactory, HasSpatial;

    protected $table = 'wilayah';

    protected $fillable = [
        'keluarga_id',
        'nama',
        'area',
        'keterangan'
    ];

    protected $casts = [
        'area' => Polygon::class,
    ];

    public function keluarga(): BelongsTo
    {
        return $this->belongsTo(Keluarga::class);
    }
}
