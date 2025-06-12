<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('bantuan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keluarga_id')->constrained('keluarga')->onDelete('cascade');
            $table->year('tahun_anggaran');
            $table->enum('status', ['ditetapkan', 'aktif', 'selesai', 'dibatalkan'])->default('ditetapkan');
            $table->decimal('nominal_per_bulan', 12, 2);
            $table->text('keterangan')->nullable();
            $table->timestamp('tanggal_penetapan');
            $table->timestamps();
            
            // Index untuk performa query
            $table->unique(['keluarga_id', 'tahun_anggaran']);
            $table->index(['tahun_anggaran', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('bantuan');
    }
};
