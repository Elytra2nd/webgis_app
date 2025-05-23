<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('anggota_keluarga', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keluarga_id')->constrained('keluarga')->onDelete('cascade');
            $table->string('nik')->unique();
            $table->string('nama');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->string('status_dalam_keluarga');
            $table->string('status_perkawinan');
            $table->string('pendidikan_terakhir');
            $table->string('pekerjaan');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('anggota_keluarga');
    }
};
