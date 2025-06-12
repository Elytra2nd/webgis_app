<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('keluarga', function (Blueprint $table) {
            // Tambahkan kolom baru jika belum ada
            if (!Schema::hasColumn('keluarga', 'koordinat_updated_at')) {
                $table->timestamp('koordinat_updated_at')->nullable()->after('longitude');
            }
            
            if (!Schema::hasColumn('keluarga', 'jumlah_anggota')) {
                $table->integer('jumlah_anggota')->default(1)->after('penghasilan_bulanan');
            }
            
            if (!Schema::hasColumn('keluarga', 'status_verifikasi')) {
                $table->enum('status_verifikasi', ['belum_verifikasi', 'terverifikasi', 'ditolak'])
                      ->default('belum_verifikasi')->after('status_ekonomi');
                $table->timestamp('tanggal_verifikasi')->nullable()->after('status_verifikasi');
                $table->foreignId('verifikator_id')->nullable()->constrained('users')->onDelete('set null')->after('tanggal_verifikasi');
                $table->text('catatan_verifikasi')->nullable()->after('verifikator_id');
            }
            
            if (!Schema::hasColumn('keluarga', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('keterangan');
            }
            
            // Update enum status_ekonomi jika perlu
            DB::statement("ALTER TABLE keluarga MODIFY COLUMN status_ekonomi ENUM('sangat_miskin', 'miskin', 'rentan_miskin', 'kurang_mampu', 'mampu')");
            
            // Tambahkan indexes baru
            $table->index(['status_ekonomi', 'status_verifikasi'], 'idx_status_ekonomi_verifikasi');
            $table->index(['kecamatan', 'kelurahan'], 'idx_wilayah');
            $table->index(['status_verifikasi', 'created_at'], 'idx_verifikasi_tanggal');
        });
    }

    public function down(): void
    {
        Schema::table('keluarga', function (Blueprint $table) {
            $table->dropIndex('idx_status_ekonomi_verifikasi');
            $table->dropIndex('idx_wilayah');
            $table->dropIndex('idx_verifikasi_tanggal');
            
            $table->dropForeign(['verifikator_id']);
            $table->dropColumn([
                'koordinat_updated_at',
                'jumlah_anggota',
                'status_verifikasi',
                'tanggal_verifikasi',
                'verifikator_id',
                'catatan_verifikasi',
                'is_active'
            ]);
        });
    }
};
