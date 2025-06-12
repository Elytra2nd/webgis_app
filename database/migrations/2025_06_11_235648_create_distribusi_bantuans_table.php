<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('distribusi_bantuan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bantuan_id')->constrained('bantuan')->onDelete('cascade');
            $table->tinyInteger('bulan'); // 1-12
            $table->enum('status', ['belum_disalurkan', 'disalurkan', 'gagal'])->default('belum_disalurkan');
            $table->timestamp('tanggal_distribusi')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
            
            // Index dan constraint
            $table->unique(['bantuan_id', 'bulan']);
            $table->index(['status', 'tanggal_distribusi']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('distribusi_bantuan');
    }
};
