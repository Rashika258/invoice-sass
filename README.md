# 🧾 Billora — Modern All-in-One Business ERP & Invoice SaaS

**Billora** is an intuitive, fast, and feature-rich Business Operating System designed for retail stores, wholesalers, manufacturers, service providers, and accountants. It streamlines billing, inventory, staff attendance/payroll, multi-currency invoicing, Tally-style accounting, and customer management into one seamless application.

---

## 📚 Table of Contents
1. [🚀 Quick Start Guide for Developers](#-quick-start-guide-for-developers)
2. [📖 How to Use Billora (Beginner & Non-Technical User Guide)](#-how-to-use-billora-beginner--non-technical-user-guide)
   - [Step 1: Setting Up Your Business Profile](#step-1-setting-up-your-business-profile)
   - [Step 2: Adding Customers & Suppliers (Parties)](#step-2-adding-customers--suppliers-parties)
   - [Step 3: Creating Your Item Catalogue](#step-3-creating-your-item-catalogue)
   - [Step 4: Making Your First Sale Invoice / POS Bill](#step-4-making-your-first-sale-invoice--pos-bill)
   - [Step 5: Recording Purchases & Operating Expenses](#step-5-recording-purchases--operating-expenses)
   - [Step 6: Managing Employees, Attendance & Payroll](#step-6-managing-employees-attendance--payroll)
   - [Step 7: Managing Staff Logins & Team Roles](#step-7-managing-staff-logins--team-roles)
   - [Step 8: Tally-Style Accounting & Financial Reports](#step-8-tally-style-accounting--financial-reports)
3. [✨ Key Features Overview](#-key-features-overview)
4. [💡 What Can Be Improved (Future Enhancements & Suggestions)](#-what-can-be-improved-future-enhancements--suggestions)

---

## 🚀 Quick Start Guide for Developers

For complete step-by-step local installation instructions, environment configuration, database setup, and troubleshooting, refer to **[LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md)**.

### Prerequisites
- **Node.js**: v18.x or later
- **Package Manager**: `npm`, `yarn`, `pnpm`, or `bun`
- **Database**: PostgreSQL (Production) or SQLite (Local Development with Prisma ORM)

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rashika258/invoice-sass.git
   cd invoice-saas
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the provided environment template:
   ```bash
   cp .env.example .env
   # On Windows PowerShell:
   Copy-Item .env.example .env
   ```

4. **Initialize Database & Seed Full Demo Data**:
   ```bash
   # Push schema to local SQLite database
   npx prisma db push

   # Seed demo data across all features (Invoices, Items, Staff, Ledgers)
   npm run seed:all
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser!
   Log in with pre-seeded demo credentials:
   - **Admin**: `admin@billora.app` / `admin123`
   - **Staff**: `staff@billora.app` / `staff123`
   - **Auditor**: `auditor@billora.app` / `password123`

6. **Production Build & Deployment**:
   ```bash
   npm run build
   npm run start
   ```
   For full production deployment instructions (Vercel, Docker Compose, Linux PM2 + Nginx), see **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**.


---

## 📖 How to Use Billora (Beginner & Non-Technical User Guide)

Billora is designed so that anyone — even with zero accounting experience — can run their business effortlessly. Here is how to complete standard daily tasks step-by-step:

---

### Step 1: Setting Up Your Business Profile
1. Click **Settings** in the left sidebar menu (or navigate to `/settings`).
2. Go to **General Settings** & **Print & Invoices**.
3. Enter your **Business Name**, **GSTIN / Tax ID**, **Phone Number**, **Address**, and upload your **Company Logo**.
4. Choose your preferred **Business Currency** (e.g., ₹ INR, $ USD, € EUR, AED) and **Brand Color**.
5. Click **Save Settings**.

---

### Step 2: Adding Customers & Suppliers (Parties)
1. Click **Parties** -> **Parties Directory** in the left sidebar (`/customers`).
2. Click the **+ Add Party** button at the top right.
3. Fill in:
   - **Party Name** (Required)
   - **Party Type**: Select **Customer** (buyer) or **Supplier** (vendor).
   - **Phone Number** & **Email** (optional, for instant WhatsApp/email bills).
   - **GSTIN / PAN** (if registered).
   - **Opening Balance**: Enter previous outstanding amount (if any).
4. Click **Save Party**.

---

### Step 3: Creating Your Item Catalogue
1. Click **Items** -> **Items & Inventory** in the sidebar (`/items`).
2. Click **+ Add Item**.
3. Fill in:
   - **Item Name** (e.g., *Steel Pipe 2-inch*, *Consulting Service*).
   - **Item Type**: Select **Product** (physical goods) or **Service**.
   - **Sales Price (₹)** & **Purchase Price (₹)**.
   - **GST Tax Rate**: Select 0%, 5%, 12%, 18%, or 28%.
   - **Current Stock**: Starting physical quantity in hand.
   - **Min Stock Alert**: Set a minimum limit (e.g., 5 units) so Billora alerts you when stock runs low.
4. Click **Save Item**.

---

### Step 4: Making Your First Sale Invoice / POS Bill

#### Method A: Full Tax Invoice (`/invoices/new`)
1. Click **Sale** -> **Sale Invoices** in the sidebar and click **+ New Sale**.
2. **Select Customer**: Choose a customer from the dropdown (or click `+` to register one instantly).
3. **Add Items**: Click **+ Add Line Item**, choose an item, and enter the quantity. Tax and total calculations update automatically.
4. **Payment Received**: Enter any advance amount paid by cash, UPI, or bank transfer.
5. Click **Save & Preview Bill** to view, print, download PDF, or share via WhatsApp.

#### Method B: Quick Counter POS Checkout (`/pos`)
1. Click **Sale** -> **Billora POS** (`/pos`).
2. Tap products on the screen or scan barcodes.
3. Click **Pay Cash** or **UPI / Card** to complete checkout in seconds.

---

### Step 5: Recording Purchases & Operating Expenses

#### Recording Vendor Purchase Bills (`/purchases/new`)
1. Click **Purchase & Expense** -> **Purchase Bills** -> **+ New Purchase**.
2. Select the **Supplier** from whom you bought stock.
3. Add the items, quantities, and prices matching your vendor bill.
4. Click **Save Purchase Bill**. Inventory stock counts will automatically increase.

#### Recording Daily Office Expenses (`/expenses`)
1. Click **Purchase & Expense** -> **Expenses**.
2. Click **+ Add Expense**.
3. Select category (e.g., *Rent, Tea & Snacks, Electricity, Transport*), enter the amount, and payment mode.

---

### Step 6: Managing Employees, Attendance & Payroll

#### Method 1: Main Employee Directory (`/employees`)
1. Click **Staff & Attendance** -> **Employees & Staff** (`/employees`).
2. Click **+ Add Employee**.
3. Enter:
   - **Full Name** (Required)
   - **Email Address** (Optional, for digital salary slips)
   - **Position / Designation** (e.g., *Billing Staff, Store Manager, Sales Executive*)
   - **Hourly Rate (₹)** (Base rate calculated per 8-hour workday)
   - **Overtime (OT) Rate (₹/hr)** (Applied for hours worked beyond 8 hours)
4. Click **Save changes**.

#### Method 2: Logging Daily Shifts & Overtime (`/attendance`)
1. Click **Staff & Attendance** -> **Attendance & OT** (`/attendance`).
2. Select the **Employee** and **Date**.
3. Enter **Hours Worked** (e.g., 8 hours = standard shift; 10 hours = 8h base + 2h OT automatically calculated).
4. Click **Save Attendance**.
5. At the end of the month, click **View Payslip** next to any employee to generate and print their official Monthly Salary Slip.

---

### Step 7: Managing Staff Logins & Team Roles
1. Go to **Settings** -> **Team Members & Roles** (or `/settings?tab=team`).
2. Click **Add Team Member**.
3. Enter Full Name, Email, Password, and select Role:
   - **Admin**: Full access to billing, inventory, banking, reports, and settings.
   - **Staff**: Limited access for billing operators to log attendance and create invoices without viewing confidential company settings.

---

### Step 8: Tally-Style Accounting & Financial Reports
1. Click **Accounting (Tally-Style)** in the sidebar (`/accounting`).
2. **Voucher Entry (`/accounting/vouchers`)**: Use keyboard shortcuts **F4 (Contra)**, **F5 (Payment)**, **F6 (Receipt)**, **F7 (Journal)**, **F8 (Sales)**, and **F9 (Purchase)** for rapid voucher entry.
3. View instant real-time financial statements:
   - **Day Book**: Daily list of transactions.
   - **Trial Balance**: Debit vs Credit balance verification.
   - **Profit & Loss A/c**: Income vs Expense analysis.
   - **Balance Sheet**: Assets vs Liabilities statement.

---

## ✨ Key Features Overview

| Feature Category | Capabilities |
| :--- | :--- |
| **Sales & Billing** | GST & Non-GST Invoices, Proforma Invoices, Quotations, Sales Orders, Delivery Challans, POS Counter, Credit Notes, WhatsApp Sharing |
| **Purchases & Stock** | Supplier Bills, Purchase Orders, Debit Notes, Stock In/Out tracking, Low Stock Alerts, Barcode Generation, Batch & Expiry tracking |
| **Parties (CRM)** | Customer & Vendor Directory, Credit Limit Controls, Outstanding Balance tracking, Party Import/Export |
| **Staff & Payroll** | Employee Master, 8-Hour Base Shift Engine, Automatic Overtime (OT) Calculator, Biometric Kiosk, Printable Monthly Salary Slips |
| **Banking & Cash** | Multi-Bank Accounts, Cash In Hand, Cheque Register, Loan Account Tracking |
| **Accounting Hub** | Tally-Style Keyboard Gateway (F4-F9), Ledger Master (COA), Day Book, Trial Balance, P&L, Balance Sheet |
| **Customization & Security** | Multi-Firm Support, Brand Theme Studio, Auto Cloud Backup, Passcode Security, Admin/Staff Role Management |

---

## 💡 What Can Be Improved (Future Enhancements & Suggestions)

While Billora is packed with features, here are high-value technical and functional improvements recommended for future updates:

### 1. 🚀 Performance & Mobile Optimization
- **Offline PWA Support (Service Workers & IndexedDB)**: Allow billing operators to create sales bills even when internet connectivity drops, automatically syncing queued bills once online.
- **Enhanced Mobile Responsive Layouts**: Further optimize data tables and POS touch layouts for smaller smartphones and handheld POS devices.

### 2. ⚡ Integration & Payment Gateways
- **Dynamic UPI QR Code Generation**: Display dynamic Payment QR codes directly on invoices and POS screens so customers can scan and pay instantly via PhonePe, Google Pay, or Paytm.
- **Direct WhatsApp Business API Integration**: Upgrade from `wa.me` links to official Meta WhatsApp Cloud API for automated background PDF dispatching.
- **Tally XML / JSON Live Sync**: Enable one-click two-way sync with Tally Prime desktop software.

### 3. 🛡️ Advanced Security & Audit
- **Granular Custom Role Permissions**: Allow creating custom roles beyond simple `ADMIN` / `STAFF` (e.g., *Warehouse Manager* who only sees stock, or *Accountant* who only sees ledgers).
- **Two-Factor Authentication (2FA)**: Option to enable SMS / Authenticator app OTPs for Admin sign-in.

### 4. 📊 AI Insights & Analytics
- **AI Sales & Cashflow Forecasting**: Provide predictive analytics for inventory reordering and monthly sales trends.
- **Automated Payment Reminder Schedules**: Send automated SMS/WhatsApp debt collection reminders N days before and after invoice due dates.

---

## 📄 License
This project is licensed under the MIT License.
