<?php

namespace Database\Factories;

use App\Models\KnowledgeBase;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class KnowledgeBaseFactory extends Factory
{
    protected static ?User $user = null;

    public function definition(): array
    {
        if (static::$user === null) {
            static::$user = User::first() ?? User::factory()->create();
        }

        $categories = ['network', 'server', 'application', 'security', 'monitoring', 'troubleshooting'];
        $category = $this->faker->randomElement($categories);

        $contents = [
            'network' => [
                'title' => $this->faker->randomElement([
                    'Cara Mengatasi Masalah Koneksi Jaringan',
                    'Konfigurasi VLAN untuk Segmentasi Jaringan',
                    'Mengatur Akses VPN untuk Pengguna Remote',
                    'Optimasi Bandwidth Jaringan',
                    'Masalah Resolusi DNS dan Solusinya',
                ]),
                'summary' => 'Panduan lengkap untuk mendiagnosis dan mengatasi masalah konektivitas jaringan, termasuk gejala umum, penyebab akar, dan langkah-langkah solusi.',
                'content' => $this->faker->randomElement([
                    "## Masalah
                    Perangkat tidak dapat terhubung ke jaringan, koneksi sering terputus, atau performa jaringan lambat dengan latensi tinggi.

                    ## Langkah Diagnostik
                    1. Periksa koneksi fisik (kabel, port)
                    2. Verifikasi konfigurasi IP
                    3. Tes resolusi DNS
                    4. Ping gateway dan alamat eksternal
                    5. Cek konflik jaringan

                    ## Solusi
                    - Restart antarmuka jaringan
                    - Update driver jaringan
                    - Periksa aturan firewall
                    - Verifikasi tabel routing
                    - Hubungi ISP jika ada masalah eksternal

                    ## Tips Tambahan
                    Gunakan ping -t untuk monitoring koneksi berkelanjutan. Periksa log router untuk pola koneksi yang bermasalah.",
                    "## Masalah
                    Pengguna remote tidak dapat mengakses sumber daya perusahaan atau VPN terputus secara berkala.

                    ## Langkah Diagnostik
                    1. Verifikasi kredensial pengguna
                    2. Cek konektivitas internet
                    3. Periksa konfigurasi VPN
                    4. Tes akses dari lokasi berbeda
                    5. Review log koneksi

                    ## Solusi
                    - Instal klien VPN
                    - Impor konfigurasi server
                    - Konfigurasi autentikasi
                    - Tes koneksi
                    - Verifikasi split tunneling

                    ## Tips Tambahan
                    Pastikan firewall mengizinkan lalu lintas VPN. Gunakan protokol UDP untuk performa lebih baik jika didukung.",
                ]),
            ],
            'server' => [
                'title' => $this->faker->randomElement([
                    'Optimasi Performa Server',
                    'Hardening Server Linux',
                    'Pemeliharaan Database Server',
                    'Konfigurasi Web Server Terbaik',
                    'Prosedur Backup dan Pemulihan Server',
                ]),
                'summary' => 'Praktik terbaik untuk menjaga performa server yang optimal, termasuk monitoring resource, tuning konfigurasi, dan prosedur pemeliharaan preventif.',
                'content' => $this->faker->randomElement([
                    "## Masalah
                    Server mengalami penggunaan resource tinggi, performa lambat, atau kebutuhan memori yang berlebihan.

                    ## Langkah Diagnostik
                    1. Aktifkan monitoring proses
                    2. Optimasi query database
                    3. Konfigurasi mekanisme caching
                    4. Implement load balancing
                    5. Review dan optimasi kode aplikasi

                    ## Solusi
                    - Enable process monitoring
                    - Optimasi query database
                    - Konfigurasi caching
                    - Implement load balancing
                    - Rutinitas log rotation

                    ## Tips Tambahan
                    Jadwalkan maintenance rutin. Gunakan tools seperti htop, iotop untuk monitoring real-time. Periksa log sistem untuk pola anomali.",
                    "## Masalah
                    Server Linux perlu dikonfigurasi untuk keamanan maksimal sesuai standar keamanan perusahaan.

                    ## Langkah Diagnostik
                    1. Review layanan yang berjalan
                    2. Periksa konfigurasi firewall
                    3. Audit pengguna dan akses
                    4. Update patch keamanan
                    5. Implement intrusion detection

                    ## Solusi
                    - Disable layanan yang tidak diperlukan
                    - Konfigurasi aturan firewall
                    - Enable SELinux/AppArmor
                    - Implement 2FA untuk SSH
                    - Rutinitas audit pengguna

                    ## Tips Tambahan
                    Gunakan fail2ban untuk mencegah brute force. Keep kernel updated. Gunakan SSH key-based authentication.",
                ]),
            ],
            'application' => [
                'title' => $this->faker->randomElement([
                    'Panduan Deployment Aplikasi',
                    'Mengatasi Error Aplikasi',
                    'Praktik Terbaik Integrasi API',
                    'Hardening Keamanan Aplikasi',
                    'Tuning Performa untuk Aplikasi Web',
                ]),
                'summary' => 'Panduan lengkap untuk deployment dan pemeliharaan aplikasi, termasuk strategi deployment, penanganan error, dan optimasi performa.',
                'content' => $this->faker->randomElement([
                    "## Masalah
                    Aplikasi gagal di-deploy, error runtime, atau performa tidak optimal setelah update.

                    ## Langkah Diagnostik
                    1. Review code sebelum deployment
                    2. Jalankan automated tests
                    3. Deploy ke staging environment
                    4. Lakukan smoke tests
                    5. Deploy ke production

                    ## Solusi
                    - Build aplikasi
                    - Jalankan automated tests
                    - Deploy ke staging
                    - Lakukan smoke tests
                    - Deploy ke production

                    ## Tips Tambahan
                    Gunakan CI/CD pipeline. Implement rollback otomatis. Monitor metrics post-deployment. Dokumentasikan proses deployment.",
                    "## Masalah
                    Aplikasi mengalami error yang tidak terduga, exception runtime, atau failure layanan pihak ketiga.

                    ## Langkah Diagnostik
                    1. Review log aplikasi
                    2. Periksa pesan error
                    3. Reproduksi issue
                    4. Isolasi root cause
                    5. Terapkan fix

                    ## Solusi
                    - Review log aplikasi
                    - Cek pesan error
                    - Reproduksi issue
                    - Isolasi root cause
                    - Terapkan fix

                    ## Tips Tambahan
                    Gunakan error tracking tools seperti Sentry. Implement logging terstruktur. Setup alerting untuk error kritis.",
                ]),
            ],
            'security' => [
                'title' => $this->faker->randomElement([
                    'Prosedur Respons Insiden Keamanan',
                    'Panduan Penilaian Kerentanan',
                    'Praktik Terbaik Kontrol Akses',
                    'Implementasi Enkripsi Data',
                    'Audit dan Kepatuhan Compliance',
                ]),
                'summary' => 'Prosedur untuk menangani insiden keamanan, termasuk deteksi, kontainmen, eradikasi, dan langkah pemulihan.',
                'content' => $this->faker->randomElement([
                    "## Masalah
                    Terdeteksi insiden keamanan seperti unauthorized access, malware, atau data breach yang memerlukan respons segera.

                    ## Langkah Diagnostik
                    1. Identifikasi indikator kompromi
                    2. Isolasi sistem yang terdampak
                    3. Kumpulkan bukti forensik
                    4. Analisis scope insiden
                    5. Notifikasi stakeholder

                    ## Solusi
                    - Identifikasi indikator kompromi
                    - Isolasi sistem yang terdampak
                    - Kumpulkan bukti forensik
                    - Analisis scope insiden
                    - Notifikasi stakeholder

                    ## Tips Tambahan
                    Dokumentasikan semua langkah. Preservasi bukti digital. Lakukan post-mortem analysis. Update playbooks insiden.",
                    "## Masalah
                    Perlu menilai kerentanan keamanan sistem dan aplikasi secara berkala untuk mencegah eksploitasi.

                    ## Langkah Diagnostik
                    1. Lakukan network scanning
                    2. Lakukan application testing
                    3. Review konfigurasi
                    4. Lakukan penetration testing
                    5. Prioritaskan temuan

                    ## Solusi
                    - Lakukan network scanning
                    - Lakukan application testing
                    - Review konfigurasi
                    - Lakukan penetration testing
                    - Prioritaskan temuan

                    ## Tips Tambahan
                    Critical: Tindakan segera. High: Dalam 24 jam. Medium: Dalam 1 minggu. Low: Maintenance window berikutnya. Dokumentasikan semua perubahan.",
                ]),
            ],
            'monitoring' => [
                'title' => $this->faker->randomElement([
                    'Setup Sistem Monitoring',
                    'Konfigurasi Alert',
                    'Analisis dan Manajemen Log',
                    'Pengumpulan Metrik Performa',
                    'Konfigurasi Dashboard Monitoring',
                ]),
                'summary' => 'Setup monitoring komprehensif untuk tracking kesehatan sistem, metrik performa, dan pembuatan alert untuk deteksi masalah proaktif.',
                'content' => $this->faker->randomElement([
                    "## Masalah
                    Sistem tidak memiliki monitoring yang memadai, tidak ada alerting untuk insiden kritis, atau visibility rendah ke performa.

                    ## Langkah Diagnostik
                    1. Identifikasi metrik kunci untuk monitoring
                    2. Pilih tools monitoring yang sesuai
                    3. Konfigurasi pengumpulan metrik
                    4. Setup alerting dan notifikasi
                    5. Implement dashboard visualisasi

                    ## Solusi
                    - Identifikasi metrik kunci
                    - Pilih tools monitoring
                    - Konfigurasi pengumpulan metrik
                    - Setup alerting dan notifikasi
                    - Implement dashboard visualisasi

                    ## Tips Tambahan
                    Gunakan Prometheus untuk metrik, Grafana untuk visualisasi. Alertmanager untuk notifikasi. Konfigurasi retention data yang tepat.",
                    "## Masalah
                    Alert tidak dikonfigurasi dengan benar, menyebabkan alert fatigue atau missing critical alerts.

                    ## Langkah Diagnostik
                    1. Definisikan level alert (P1-P4)
                    2. Set notifikasi channels
                    3. Konfigurasi aturan escalation
                    4. Test alert delivery
                    5. Dokumentasikan prosedur alert

                    ## Solusi
                    - Definisikan level alert
                    - Set notifikasi channels
                    - Konfigurasi aturan escalation
                    - Test alert delivery
                    - Dokumentasikan prosedur alert

                    ## Tips Tambahan
                    P1: Critical - Immediate action. P2: High - Dalam 1 jam. P3: Medium - Dalam 4 jam. P4: Low - Business day berikutnya. Group related alerts.",
                ]),
            ],
            'troubleshooting' => [
                'title' => $this->faker->randomElement([
                    'Metodologi Troubleshooting Sistematis',
                    'Pesan Error Umum dan Solusinya',
                    'Teknik Debugging',
                    'Strategi Isolasi Masalah',
                    'Prosedur Pemulihan Sistem',
                ]),
                'summary' => 'Pendekatan sistematis untuk troubleshooting masalah teknis, termasuk identifikasi masalah, analisis root cause, dan strategi resolusi.',
                'content' => $this->faker->randomElement([
                    "## Masalah
                    Masalah teknis yang memerlukan pendekatan terstruktur untuk mendiagnosis dan menyelesaikan secara efektif.

                    ## Langkah Diagnostik
                    1. Definisikan masalah dengan jelas
                    2. Kumpulkan informasi
                    3. Formulasi hipotesis
                    4. Tes hipotesis
                    5. Implement solusi

                    ## Solusi
                    - Definisikan masalah
                    - Kumpulkan informasi
                    - Formulasi hipotesis
                    - Tes hipotesis
                    - Implement solusi

                    ## Tips Tambahan
                    Dokumentasikan semua langkah. Reproduksi issue sebelum fix. Verifikasi solusi. Buat knowledge base article untuk masalah serupa.",
                    "## Masalah
                    Error messages yang tidak jelas atau tidak memberikan informasi yang cukup untuk diagnosis cepat.

                    ## Langkah Diagnostik
                    1. Identifikasi kode error
                    2. Cek log aplikasi
                    3. Verifikasi status sistem
                    4. Interview pengguna
                    5. Review perubahan terakhir

                    ## Solusi
                    - Identifikasi kode error
                    - Cek log aplikasi
                    - Verifikasi status sistem
                    - Interview pengguna
                    - Review perubahan terakhir

                    ## Tips Tambahan
                    Gunakan error codes standar. Include stack traces. Log environment variables. Document reproduction steps.",
                ]),
            ],
        ];

        $content = $contents[$category];
        $slug = strtolower(str_replace(' ', '-', preg_replace('/[^a-zA-Z0-9\s]/', '', $content['title'])));
        $slug .= '-' . $this->faker->unique()->randomNumber(5);

        return [
            'title' => $content['title'],
            'slug' => $slug,
            'summary' => $content['summary'],
            'content' => $content['content'],
            'category' => $category,
            'tags' => $this->faker->randomElements(['urgent', 'sering', 'dokumentasi', 'panduan', 'best-practices', 'keamanan', 'performa'], $this->faker->numberBetween(2, 4)),
            'is_published' => $this->faker->boolean(80),
            'view_count' => $this->faker->numberBetween(0, 1000),
            'usage_count' => $this->faker->numberBetween(0, 500),
            'rating' => $this->faker->randomElement([null, 3.5, 4.0, 4.5, 5.0]),
            'created_by' => static::$user->id,
            'updated_by' => $this->faker->boolean(50) ? static::$user->id : null,
        ];
    }
}