<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('keluarga', function (Blueprint $table) {
            $table->id();
            $table->string('no_kk', 16)->unique();
            $table->string('nama_kepala_keluarga');
            $table->text('alamat');
            $table->string('rt');
            $table->string('rw');
            $table->string('kelurahan');
            $table->string('kecamatan');
            $table->string('kota');
            $table->string('provinsi');
            $table->string('kode_pos')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Kolom spatial point (lokasi), gunakan geometry('lokasi', 'point')
            $table->geometry('lokasi', subtype: 'point')->nullable();

            $table->enum('status_ekonomi', ['sangat_miskin', 'miskin', 'rentan_miskin']);
            $table->integer('penghasilan_bulanan')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['latitude', 'longitude'], 'idx_coordinates');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keluarga');
    }
};
