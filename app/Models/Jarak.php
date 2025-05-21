<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MatanYadaev\EloquentSpatial\Objects\LineString;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Jarak extends Model
{
    use HasFactory, HasSpatial;

    protected $table = 'jarak';

    protected $fillable = [
        'keluarga_id',
        'nama',
        'line',
        'panjang'
    ];

    protected $casts = [
        'line' => LineString::class,
    ];

    public function keluarga(): BelongsTo
    {
        return $this->belongsTo(Keluarga::class);
    }
}
