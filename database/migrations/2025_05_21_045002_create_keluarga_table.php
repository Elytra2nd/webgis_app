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
            $table->geometry('lokasi', 'point')->nullable();
            $table->enum('status_ekonomi', ['sangat_miskin', 'miskin', 'rentan_miskin']);
            $table->integer('penghasilan_bulanan')->nullable();
            $table->text('keterangan')->nullable();
            $table->decimal('latitude', 10, 8)->nullable()->after('kode_pos');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->index(['latitude', 'longitude'], 'idx_coordinates');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('keluarga');
    }
};
