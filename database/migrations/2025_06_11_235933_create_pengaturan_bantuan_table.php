<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pengaturan_bantuan', function (Blueprint $table) {
            $table->id();
            $table->year('tahun_anggaran');
            $table->decimal('nominal_default', 12, 2);
            $table->integer('kuota_maksimal')->nullable();
            $table->date('tanggal_mulai_pendaftaran');
            $table->date('tanggal_akhir_pendaftaran');
            $table->date('tanggal_mulai_distribusi');
            $table->date('tanggal_akhir_distribusi');
            $table->enum('status', ['draft', 'aktif', 'selesai'])->default('draft');
            $table->text('kriteria_penerima')->nullable();
            $table->timestamps();
            
            $table->unique('tahun_anggaran');
        });
    }

    public function down()
    {
        Schema::dropIfExists('pengaturan_bantuan');
    }
};
