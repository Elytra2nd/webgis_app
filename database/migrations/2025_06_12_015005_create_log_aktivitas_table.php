<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('log_aktivitas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('aksi'); // 'penetapan_bantuan', 'distribusi_bantuan', 'update_koordinat'
            $table->string('tabel_target'); // 'bantuan', 'keluarga', etc
            $table->unsignedBigInteger('target_id');
            $table->json('data_lama')->nullable();
            $table->json('data_baru')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
            
            // Index untuk performa
            $table->index(['user_id', 'created_at']);
            $table->index(['aksi', 'created_at']);
            $table->index(['tabel_target', 'target_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('log_aktivitas');
    }
};
