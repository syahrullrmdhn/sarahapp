# SARAH (Smart Automated Response & Alerting Hub)

Implementasi awal sistem SARAH berbasis **Laravel 13 + React + Tailwind**, mencakup:

- Headless REST API untuk incident ticketing
- RBAC granular (Super Admin, NOC Lead, NOC Staff, EOS, Paragonian)
- SLA timer (response + resolution) sesuai matriks P1-P5
- Auto-escalation command untuk tiket yang melewati SLA response tanpa acknowledge
- Webhook endpoint aman untuk Zabbix/Grafana/Observium
- Endpoint Telegram bot webhook (siap dikonfigurasi token/secret)
- Audit trail perubahan data tiket
- Phoenix Dashboard (React) dengan Kanban drag-and-drop + countdown SLA
- Multi-menu view: Dashboard, Ticket Board, Integrations, User Management, Audit Log

## Stack

- Backend: Laravel 13 (PHP 8.4)
- Frontend: React 19 + Vite + Tailwind CSS 4
- Auth API: Laravel Sanctum
- Database: PostgreSQL (disarankan production)

## PHP Path (Device Anda)

Project ini sudah disesuaikan dan diuji dengan PHP path:

```bash
/Users/syahrulramadhan/Library/Application Support/Herd/bin/php
```

Contoh alias opsional:

```bash
alias php="/Users/syahrulramadhan/Library/Application Support/Herd/bin/php"
alias composer="/Users/syahrulramadhan/Library/Application Support/Herd/bin/composer"
```

## Setup Cepat

```bash
cd /Users/syahrulramadhan/Documents/Code/sarah/sarah-app
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate:fresh --seed
npm run build
```

Untuk development:

```bash
composer run dev
```

## Kredensial Seed (Development)

- superadmin@sarah.local / `S4rahSecure!2026`
- noclead@sarah.local / `N0cLeadSecure!2026`
- nocstaff@sarah.local / `N0cStaffSecure!2026`

## Endpoint API Penting

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Ticketing

- `GET /api/tickets/board`
- `GET /api/tickets`
- `POST /api/tickets`
- `PATCH /api/tickets/{ticket}/status`
- `PATCH /api/tickets/{ticket}/assign`

### Admin & User Management

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/{user}`
- `GET /api/admin/roles`
- `GET /api/admin/audit-logs`

### Monitoring Ingest

- `POST /api/webhooks/{source}`
  - `source`: `zabbix`, `grafana`, `observium`
  - Header wajib: `X-SARAH-Signature`
  - Signature = `hash_hmac('sha256', rawBody, shared_secret)`

### Telegram Bot (placeholder endpoint)

- `POST /api/integrations/telegram/webhook`
- Jika `TELEGRAM_WEBHOOK_SECRET` diisi, header ini wajib:
  - `X-Telegram-Bot-Api-Secret-Token`

## SLA & Auto Escalation

Matriks prioritas yang dipakai:

- P1: response 15m, resolution 2h
- P2: response 30m, resolution 4h
- P3: response 1h, resolution 8h
- P4: response 4h, resolution 24h
- P5: response 8h, resolution 96h

Scheduler:

```bash
php artisan schedule:work
```

Command escalasi otomatis:

```bash
php artisan sarah:escalate-overdue-tickets
```

## Catatan Keamanan

- Auth token via Sanctum
- RBAC middleware berbasis permission slug
- Webhook signature verification (HMAC SHA-256)
- Rate limit terpisah untuk API/Webhook/Telegram
- Audit log perubahan data tiket
- Validasi input ketat pada seluruh endpoint utama

## Saran Lanjutan (Recommended)

1. Integrasikan Redis + queue worker terpisah untuk throughput webhook tinggi.
2. Aktifkan Laravel Reverb/Pusher untuk real-time push (frontend saat ini sudah siap polling + event-ready).
3. Tambahkan SIEM forwarding dan anomaly detection untuk incident burst.
4. Gunakan secrets manager (Vault/KMS) untuk seluruh credential production.
5. Tambah test coverage untuk skenario race condition Kanban dan high-volume webhook replay.
