# 💻 Billora OS — Local Setup & Development Guide

A complete, beginner-friendly guide to installing, configuring, running, and testing **Billora** on your local machine.

---

## ⚡ 60-Second Quick Start (For the Impatient)

If you already have **Node.js 18+ (Recommended: Node 20 LTS)** and **Git** installed, run these commands in your terminal:

```bash
# 1. Clone the repository
git clone https://github.com/Rashika258/invoice-sass.git
cd invoice-saas

# 2. Install dependencies
npm install

# 3. Create .env from template
cp .env.example .env

# 4. Initialize database schema & generate Prisma Client
npx prisma db push

# 5. Seed full demo data across all features (Users, Invoices, Items, Tally Ledgers)
npm run seed:all

# 6. Start the development server
npm run dev
```

Now open **[http://localhost:3000](http://localhost:3000)** in your browser!
Log in using:
- **Email**: `admin@billora.app`
- **Password**: `admin123`

---

## 📋 Prerequisites & System Requirements

Before beginning, ensure your system has the following tools installed:

| Tool | Minimum Version | Recommended Version | How to Check |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.18.0` | `v20.x LTS` or `v22.x` | `node -v` |
| **npm** | `v9.0.0` | `v10.x+` (comes with Node) | `npm -v` |
| **Git** | `v2.30+` | Latest | `git --version` |
| **OS** | Windows 10/11, macOS, or Linux (Ubuntu 20.04+) | 64-bit OS | — |

> [!TIP]
> If you do not have Node.js installed, download the **LTS version** from [nodejs.org](https://nodejs.org/) or install it using [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows).

---

## 🛠️ Step-by-Step Installation Guide

### Step 1: Clone the Repository

Open your terminal (PowerShell, Command Prompt, macOS Terminal, or Linux Bash):

```bash
git clone https://github.com/Rashika258/invoice-sass.git
cd invoice-saas
```

---

### Step 2: Install Project Dependencies

Install all NPM packages (Next.js 16, React 19, Prisma ORM, Tailwind/Lucide icons, etc.):

```bash
npm install
```

> [!NOTE]
> During installation, `prisma generate` will automatically run via the `postinstall` hook to create type-safe Prisma client bindings.

---

### Step 3: Configure Environment Variables

The project includes a ready-to-use template `.env.example`. Create your local `.env` file:

#### On Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

#### On macOS / Linux (Bash):
```bash
cp .env.example .env
```

#### Understanding the `.env` Configuration:

The default settings work out of the box with zero external configuration required:

```env
# ─── 1. DATABASE CONFIGURATION (Default: Zero-Config SQLite) ───
DATABASE_URL="file:./prisma/dev.db"

# ─── 2. AUTHENTICATION & APP URL ─────────────────────────────
AUTH_SECRET="billora_super_secret_local_dev_key_change_in_production"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Billora"
NODE_ENV="development"

# ─── 3. OPTIONAL EXTERNAL INTEGRATIONS ────────────────────────
# (Leave as-is for local development; dummy fallbacks are built-in)
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_key_secret"
OPENAI_API_KEY="sk-proj-..."
GEMINI_API_KEY="AIzaSy..."
```

---

### Step 4: Initialize the Database (Prisma ORM)

Push the database schema directly to your local SQLite database:

```bash
npx prisma db push
```

This will create `prisma/dev.db` with all 14+ models and relations (Invoices, Items, Parties, Employees, Attendance, Payroll, Ledgers, Journal Vouchers, Appointments, Audit Logs, and Settings).

---

### Step 5: Seed Demo Data Across All Features

To immediately populate your local instance with rich, interconnected dummy data:

```bash
npm run seed:all
```

This populates:
- **5 RBAC User Profiles** (Admin, Billing Staff, Warehouse Clerk, CA Auditor, Counter Sales)
- **Business Profile** (Billora Enterprises Pvt Ltd, GSTIN: `29AAACB1234C1Z5`)
- **Bank & Cash Accounts** (HDFC Current, SBI Operations, Petty Cash, POS Cash Drawer)
- **11 Master Items** across Pharma, Electronics, Food, Salon, and Manufacturing
- **13 Business Documents** (Sales, Purchases, Delivery Challans, Estimates, Credit/Debit Notes)
- **19 Tally Double-Entry Ledgers** & balanced journal vouchers
- **Staff Attendance & Payroll** with historical punch logs and tax deductions
- **Appointments, Prescriptions, Recurring Invoices, and Real-time Stock Alerts**

#### 🔑 Pre-Configured Test Login Accounts:

| Role | Email | Password | Primary Functions & Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@billora.app` | `admin123` | Full access, settings, tax setup, team management, reports |
| **Billing Staff** | `staff@billora.app` | `staff123` | Invoicing, sales orders, POS billing, customer directory |
| **Warehouse Clerk** | `warehouse@billora.app` | `password123` | Stock inward/outward, delivery challans, serial numbers, batches |
| **CA / Auditor** | `auditor@billora.app` | `password123` | Tally double-entry ledgers, balance sheet, trial balance, tax audit |
| **Sales Desk** | `sales@billora.app` | `password123` | Quick touch POS checkout, cash drawer transactions |

---

### Step 6: Start the Development Server

Launch the local Next.js dev server:

```bash
npm run dev
```

You should see:
```text
  ▲ Next.js 16.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in ~2s
```

Visit **[http://localhost:3000](http://localhost:3000)** and log in with any seeded credentials above!

---

## 🧪 Testing & Quality Assurance

Billora comes with an extensive testing suite:

### 1. Unit & Integration Tests (Vitest)
Run all 156 unit and integration tests:
```bash
# Run tests once:
npm test

# Run tests in interactive watch mode:
npm run test:watch
```

### 2. End-to-End Browser Tests (Playwright)
Ensure you have downloaded the Playwright browser binaries once:
```bash
npx playwright install chromium
```
Then run the E2E suite:
```bash
# Headless run:
npm run test:e2e

# Interactive UI test runner:
npm run test:e2e:ui
```

### 3. Static Type Checking
Verify strict TypeScript compliance across all files:
```bash
npm run type
```

---

## 🗄️ Database Management & Utilities

### Visual Database Inspection (Prisma Studio)
Inspect and edit database records directly in a clean browser UI:
```bash
npx prisma studio
```
Access the studio at **[http://localhost:5555](http://localhost:5555)**.

### Backup Database
Export all database records and foreign key relations into JSON:
```bash
npm run db:backup
```
Backups are saved to `backups/backup_<timestamp>.json`.

### Reset Database Cleanly
To wipe and restore a clean slate:
```bash
# On Windows PowerShell:
Remove-Item prisma/dev.db -ErrorAction SilentlyContinue
npx prisma db push
npm run seed:all

# On macOS / Linux:
rm -f prisma/dev.db
npx prisma db push
npm run seed:all
```

---

## 📱 Mobile App Setup (Capacitor iOS & Android)

Billora is configured with **Capacitor** for hybrid mobile deployment:

```bash
# Sync web build assets with native mobile projects:
npm run mobile:sync

# Open Android Studio:
npm run mobile:android

# Open Xcode (macOS only):
npm run mobile:ios
```

---

## ❓ Frequently Asked Questions & Troubleshooting

### 1. Port 3000 is already in use
Specify another port when starting the dev server:
```bash
npm run dev -- -p 3001
```

### 2. `Cannot find module '@prisma/client'` or Prisma schema out of sync
Re-generate the client bindings:
```bash
npx prisma generate
```

### 3. "SQLite database is locked" error during tests
SQLite handles writes with file-level locks. Ensure:
1. You do not have multiple parallel seeders or background migration scripts running at the same moment.
2. In Playwright, tests run with `workers: 1` as configured in `playwright.config.ts`.

### 4. How to switch to PostgreSQL for local or staging testing?
In your `.env` file, change `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/billora_db?schema=public"
```
Then run:
```bash
npx prisma db push
npm run seed:all
```

### 5. Clearing Next.js build cache
If you encounter unexpected build or style caching issues:
```bash
# Windows PowerShell:
Remove-Item -Recurse -Force .next
npm run dev

# macOS / Linux:
rm -rf .next
npm run dev
```

---

## 📂 Project Architecture Quick Tour

- `src/app/` — Next.js App Router (Dashboard, Auth, Invoices, POS, Inventory, Reports, Settings)
- `src/actions/` — Next.js Server Actions for secure mutations (invoices, inventory, accounting)
- `src/components/` — Shared UI design system, forms, dialogs, charts, and data tables
- `src/lib/` — Business logic, tax calculations, payment gateway adapters, and reliability safeguards
- `scripts/` — Automated seeder (`seed-db.ts`) and database backup scripts
- `prisma/` — Data schema definition (`schema.prisma`) and SQLite development database
- `tests/` — End-to-end Playwright tests and component unit tests

---

### Need Help?
- Found a bug? Open an issue on [GitHub Issues](https://github.com/Rashika258/invoice-sass/issues).
- Want to deploy to production? Check our comprehensive [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).
