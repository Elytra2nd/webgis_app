<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('keluarga', function (Blueprint $table) {
            $table->string('rt')->nullable()->change();
            $table->string('rw')->nullable()->change();
            $table->string('kelurahan')->nullable()->change();
            $table->string('kecamatan')->nullable()->change();
            $table->string('kota')->nullable()->change();
            $table->string('provinsi')->nullable()->change();
            $table->string('kode_pos')->nullable()->change();
            $table->integer('penghasilan_bulanan')->nullable()->change();
            $table->text('keterangan')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('keluarga', function (Blueprint $table) {
            $table->string('rt')->nullable(false)->change();
            $table->string('rw')->nullable(false)->change();
            $table->string('kelurahan')->nullable(false)->change();
            $table->string('kecamatan')->nullable(false)->change();
            $table->string('kota')->nullable(false)->change();
            $table->string('provinsi')->nullable(false)->change();
            $table->string('kode_pos')->nullable(false)->change();
            $table->integer('penghasilan_bulanan')->nullable(false)->change();
            $table->text('keterangan')->nullable(false)->change();
        });
    }
};
