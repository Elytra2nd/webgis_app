<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin utama untuk Dinas Sosial Kalimantan Barat
        User::create([
            'name' => 'Admin Dinas Sosial Kalbar',
            'email' => 'admin@dinsos.kalbarprov.go.id',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Admin untuk Pontianak
        User::create([
            'name' => 'Admin Pontianak',
            'email' => 'admin@pontianak.go.id',
            'password' => Hash::make('pontianak123'),
            'email_verified_at' => now(),
        ]);

        // Admin untuk Singkawang
        User::create([
            'name' => 'Admin Singkawang',
            'email' => 'admin@singkawang.go.id',
            'password' => Hash::make('singkawang123'),
            'email_verified_at' => now(),
        ]);
    }
}
