# 🏢 Sqbe HRMS — Enterprise Cloud HR & Workforce Operating System

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Security](https://img.shields.io/badge/Security-Zero--Trust%20RBAC-059669?style=for-the-badge&logo=shield&logoColor=white)

**A high-performance, multi-tenant, cloud-native Human Resource Management System engineered with full statutory compliance, GPS-geofenced attendance, automated 5-step payroll, 360° performance reviews, and visual ATS recruitment.**

[📖 Read Full Technical Documentation (docs.md)](./docs.md) • [🚀 Quick Start](#-quick-start-guide) • [👥 Demo Personas](#-pre-configured-demo-personas) • [🧩 Modules](#-core-modules-overview) • [🔒 Security & Architecture](#-security--multi-tenant-architecture)

</div>

---

## 🌟 Executive Overview

**Sqbe HRMS** is an enterprise-grade workforce operating system designed for modern global enterprises, fast-growing tech companies, and distributed teams. It unifies core HR operations, payroll processing, statutory deductions, geofenced mobile attendance, talent acquisition, performance reviews, employee self-service (ESS), expense reimbursements, and workplace engagement into a unified, ultra-responsive web application.

Built on **React 19**, **Tailwind CSS v4**, **Express**, **Prisma ORM**, and **PostgreSQL**, Sqbe HRMS enforces strict **application-layer multi-tenant data isolation**, **10-tier Role-Based Access Control (RBAC)**, **cryptographic HMAC-SHA256 signed file storage**, and an **immutable audit log trail**.

---

## 🚀 Key System Features

- 🏢 **Multi-Tenant Architecture**: Strict logical tenant isolation across all PostgreSQL database models with tenant-scoped repositories and automated cross-tenant security verification tests.
- 📍 **GPS Geofenced Attendance**: Real-time geolocation verification using the Haversine formula, configurable perimeter radiuses (e.g., 200m), strict/warning perimeter policies, and anti-spoofing telemetry.
- 💰 **Statutory Indian Payroll Engine**: Automated 5-step payroll wizard with statutory calculations for Basic Salary (40%), HRA (20%), Special Allowances (30%), Provident Fund (12%), ESI (0.75%), Professional Tax (₹200), TDS, Loss of Pay (LOP) integration, and dynamic PDF payslip generation.
- 🎯 **Performance & OKR Suite**: Objective Key Results tracking, weightage distribution, milestone progress, and a comprehensive 5-stage 360° review workflow (Self $\rightarrow$ Manager $\rightarrow$ Peer $\rightarrow$ HR Normalization $\rightarrow$ Final Action).
- 💼 **Recruitment & Visual ATS Kanban**: Job requisition manager, interactive multi-stage candidate hiring board (Applied $\rightarrow$ Screening $\rightarrow$ Technical $\rightarrow$ HR $\rightarrow$ Offer $\rightarrow$ Hired), interview scheduler, and candidate evaluation scorecards.
- 🌴 **Leave & Time-Off Management**: Quota tracking across statutory leave types (CL, EL, SL, Maternity/Paternity, Comp Off), multi-tier approval chains, and holiday calendars.
- 📱 **Employee Self-Service (ESS)**: Dedicated employee portal for single-click mobile GPS clock-in, leave requests, expense reimbursements, goal tracking, and instant payslip PDF downloads.
- 🧾 **Expense Claims & Reimbursements**: Multi-currency expense submission, category classification (Travel, Meals, Hardware, Medical), receipt file attachments, and manager-to-finance approval workflows.
- ❤️ **Employee Engagement & Kudos**: Company-wide announcement boards with pinning and like reactions, accompanied by peer-to-peer Kudos recognition badges with confetti animations.
- 🔌 **Integration Marketplace**: One-click installable apps including Slack, Jira, GitHub, Google Workspace, Zoho Books, and biometric hardware readers.
- 🛡️ **Enterprise Security & Audit Logging**: Dual-token JWT (15-min Access + 7-day Refresh in HttpOnly cookies), Bcrypt password encryption, rate-limiting, and an immutable audit log trail capturing all sensitive system mutations.

---

## 🛠️ Technology Stack

### Frontend
| Layer | Technology | Description |
|---|---|---|
| **Framework** | [React 19](https://react.dev/) | Component architecture with concurrent rendering |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Ultra-fast HMR and optimized production bundling |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first design system with rich glassmorphism |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, crisp enterprise icon library |
| **Animations** | [Motion](https://motion.dev/) & [Canvas Confetti](https://github.com/catdad/canvas-confetti) | Smooth micro-interactions and celebration effects |
| **Charts** | [Recharts](https://recharts.org/) | Dynamic analytics for headcount, payroll, and attendance |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) | High-resolution client & server PDF payslip rendering |
| **Maps** | [Leaflet](https://leafletjs.com/) | Interactive GPS geofence radar and office location maps |
| **Data Parsing** | [PapaParse](https://www.papaparse.com/) | High-performance CSV import/export engine for employee directory |

### Backend & Database
| Layer | Technology | Description |
|---|---|---|
| **Runtime** | [Node.js](https://nodejs.org/) & [tsx](https://github.com/privatenumber/tsx) | Fast TypeScript execution runtime |
| **Web Server** | [Express 4.21](https://expressjs.com/) | RESTful API v1 router with enterprise security middleware |
| **Database ORM** | [Prisma 6.4](https://www.prisma.io/) | Type-safe PostgreSQL client and schema management |
| **Database** | [PostgreSQL 16+](https://www.postgresql.org/) | Relational database with indexing and cascading constraints |
| **Authentication** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Dual-token JWT auth with Bcrypt 10-round salted hashing |
| **Validation** | [Zod 4](https://zod.dev/) | Strict runtime request body and parameter validation |
| **Rate Limiting** | [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Anti-bruteforce and DDoS protection per IP |
| **File Storage** | Cloudflare R2 / AWS S3 Compat | Cryptographically signed HMAC-SHA256 download/upload URLs |

---

## 📂 Project Architecture & Directory Layout

```
SQBE_HRMS/
├── assets/                     # Application static branding and graphics
├── prisma/
│   └── schema.prisma           # 19 PostgreSQL models with tenant relationships
├── server/                     # Backend API Server (Express + Prisma)
│   ├── app.ts                  # Express application setup, security headers, rate limiting
│   ├── config.ts               # Environment configuration parser and defaults
│   ├── types.ts                # Backend request, response, and error types
│   ├── db/
│   │   ├── prisma.ts           # PrismaClient database connection singleton
│   │   ├── repository.ts       # Tenant-scoped data repository layer (Multi-tenant mesh)
│   │   └── seed.ts             # Comprehensive PostgreSQL database seeder
│   ├── middleware/
│   │   ├── auth.ts             # JWT Bearer verification and RBAC role guards
│   │   └── moduleCheck.ts      # Tenant module enablement check middleware
│   ├── routes/
│   │   ├── admin.ts            # Organization management and module toggle APIs
│   │   ├── attendance.ts       # GPS clock-in, clock-out, records, and regularization APIs
│   │   ├── auth.ts             # Login, logout, refresh token, and password reset APIs
│   │   ├── engagement.ts       # Announcements and peer kudos recognition APIs
│   │   ├── expenses.ts         # Expense reimbursement claim and disbursal APIs
│   │   ├── files.ts            # HMAC-SHA256 signed URL generation and verification APIs
│   │   ├── hr.ts               # Employee directory, departments, designations, shifts, CSV import/export
│   │   ├── leaves.ts           # Leave balance quotas and manager approval APIs
│   │   ├── marketplace.ts      # Integration marketplace apps and installation APIs
│   │   ├── notifications.ts    # Real-time user notification feed APIs
│   │   ├── payroll.ts          # Statutory salary structures, payroll runs, and payslips
│   │   ├── performance.ts      # OKR goals and 5-stage 360-degree review cycles
│   │   ├── recruitment.ts      # Job postings, candidate ATS pipeline, and interview scheduler
│   │   └── test-tenant.ts      # Automated cross-tenant isolation test runner
│   ├── services/
│   │   ├── audit.ts            # Immutable append-only audit trail logger
│   │   ├── geofence.ts         # Haversine distance and GPS drift verification engine
│   │   ├── payroll.ts          # Statutory computation and deduction formula engine
│   │   └── storage.ts          # Cloudflare R2 / S3 signed URL cryptographic generator
│   └── tests/
│       └── runAllTests.ts      # Production-readiness automated test suite
├── src/                        # Frontend Application (React 19 + Tailwind v4)
│   ├── App.tsx                 # Main layout orchestrator and module switcher
│   ├── main.tsx                # React DOM root entrypoint
│   ├── index.css               # Global Tailwind CSS v4 design tokens and utilities
│   ├── components/
│   │   ├── auth/               # LoginPage and Persona quick-switch drawer
│   │   ├── common/             # Navbar, Sidebar, Modals, Toasts, Skeleton loaders
│   │   ├── dashboard/          # Analytics widgets, attendance radar, pending approvals
│   │   └── modules/            # Complete full-featured views for all 12 modules
│   ├── context/
│   │   └── HrmsContext.tsx     # Centralized enterprise state management & API hooks
│   ├── mock/                   # High-fidelity mock fallback data
│   ├── services/               # Strongly typed API client services (fetch wrappers)
│   ├── types/
│   │   └── index.ts            # Universal frontend TypeScript interface definitions
│   └── utils/                  # Payroll math, geofence, and date calculation utilities
├── .env.example                # Template environment variables
├── package.json                # Project dependencies and script runner
├── server.ts                   # Unified dev & production server entrypoint (Express + Vite)
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite 6 build configuration with React plugin
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
Ensure the following tools are installed on your machine:
- **Node.js**: `v20.x` or higher (Node 22 recommended)
- **PostgreSQL**: `v14+` or `v16+` (or access to a cloud PostgreSQL instance like Supabase / Neon / AWS RDS)
- **Package Manager**: `npm`, `pnpm`, or `bun`

### 2. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/deva995/sqube-HRMS.git
cd SQBE_HRMS

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```

Update your `.env` configuration:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sqbe_hrms?schema=public"

# JWT Authentication Secrets
JWT_SECRET="sqbe_hrms_super_secure_access_token_jwt_secret_key_2026"
JWT_REFRESH_SECRET="sqbe_hrms_super_secure_refresh_token_jwt_secret_key_2026"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Optional Cloudflare R2 / AWS S3 Compatible Storage
STORAGE_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
STORAGE_BUCKET="sqbe-hrms-documents"
STORAGE_KEY_ID="your_storage_access_key_id"
STORAGE_SECRET_KEY="your_storage_secret_access_key"
STORAGE_REGION="auto"
STORAGE_SIGNED_URL_EXPIRES_IN=900
```

### 4. Initialize Database Schema & Seed Data
Generate the Prisma Client and push the schema directly to PostgreSQL:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to PostgreSQL database
npm run db:push

# Seed the database with organizations, departments, shifts, employees, and users
npm run db:seed
```

### 5. Launch Development Server
Start the unified full-stack server (runs Express API backend + Vite HMR frontend simultaneously on port `3000`):
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### 6. Run Automated Test Suite
Validate security, multi-tenancy, authentication, payroll math, and geofencing:
```bash
npm test
```

---

## 👥 Pre-Configured Demo Personas

The database comes pre-seeded with multiple organizations and personas representing every tier in the RBAC hierarchy. All default accounts use the password: `demo123`.

| Tier | Role | Name | Email | Organization | Capabilities & Pre-Loaded Scenarios |
|---|---|---|---|---|---|
| **Tier 1** | `Super Admin` | Alex Vance | `superadmin@sqbehrms.com` | **All Organizations** (Global) | Multi-tenant organization switcher, plan upgrades, module toggles, cross-tenant isolation testing, global audit logs. |
| **Tier 2** | `Admin` | Priya Sharma | `priya.sharma@sqbehrms.com` | **Acro Corp Global** | Full organizational control, employee directory mutations, department budgets, shift policies, payroll execution. |
| **Tier 3.1** | `Manager` | Vikram Aditya | `vikram.aditya@sqbehrms.com` | **Acro Corp Global** (Engineering) | Team leave approval, attendance regularization, OKR progress review, 360 performance reviews for direct reports. |
| **Tier 3.2** | `Team Lead` | Rohit Verma | `rohit.verma@sqbehrms.com` | **Acro Corp Global** (Engineering) | Sprint team supervision, peer reviews, team attendance monitoring. |
| **Tier 3.3** | `Executive` / `Employee` | Sneha Patel | `sneha.patel@sqbehrms.com` | **Acro Corp Global** (Engineering) | Employee Self Service (ESS), GPS clock-in/out, leave application, payslip PDF download, expense claim submission, OKR updates. |
| **Multi-Tenant** | `Admin` | Kavita Rao | `admin@zenithtech.io` | **Zenith Tech Labs** | Independent secondary tenant verifying complete cross-tenant boundary isolation. |

> 💡 **Quick Login**: You can click the **"Quick Switch Persona"** button on the Login page to instantly authenticate as any of the above personas with zero typing!

---

## 🧩 Core Modules Overview

```
                                  ┌────────────────────────────────┐
                                  │   Sqbe HRMS Platform Kernel    │
                                  └───────────────┬────────────────┘
          ┌───────────────────────┬───────────────┴───────────────┬───────────────────────┐
          ▼                       ▼                               ▼                       ▼
┌───────────────────┐   ┌───────────────────┐           ┌───────────────────┐   ┌───────────────────┐
│   HR Core & Org   │   │ Attendance & GPS  │           │ Payroll & Payslip │   │ Performance & OKR │
│ • Employee Master │   │ • Haversine Radar │           │ • Statutory Engine│   │ • 5-Stage Reviews │
│ • Departments     │   │ • Shift Policies  │           │ • PF, ESI, PT, TDS│   │ • 9-Box Grid      │
│ • CSV Bulk Import │   │ • Regularization  │           │ • PDF Generator   │   │ • Metric Weightage│
└───────────────────┘   └───────────────────┘           └───────────────────┘   └───────────────────┘
          │                       │                               │                       │
          ▼                       ▼                               ▼                       ▼
┌───────────────────┐   ┌───────────────────┐           ┌───────────────────┐   ┌───────────────────┐
│ Recruitment & ATS │   │ Leave Management  │           │ Self-Service(ESS) │   │ Expense & Claims  │
│ • Kanban Pipeline │   │ • Quota Balances  │           │ • Mobile Punch    │   │ • Receipt Uploads │
│ • Scorecards      │   │ • Multi-Tier Chain│           │ • Payslips & OKRs │   │ • Multi-Currency  │
│ • Interview Slots │   │ • Holiday Calendar│           │ • Leave Apply     │   │ • Disbursals      │
└───────────────────┘   └───────────────────┘           └───────────────────┘   └───────────────────┘
```

### 1. 👥 HR Core & Workforce Directory
- **360° Employee Master Record**: Personal details, masked bank accounts, emergency contacts, statutory identity documents, CTC compensation, and full lifecycle history (Onboarding $\rightarrow$ Promotion $\rightarrow$ Transfer $\rightarrow$ Exit).
- **Department & Designation Structure**: Real-time headcount tallies, budget utilization trackers, hierarchy tiers (IC-1 to DIR-1), and reporting manager chains.
- **Bulk CSV Data Operations**: Instant export and PapaParse-powered import validation with error rollbacks.

### 2. 📍 Attendance, Real-Time Geofencing & Biometrics
- **Haversine Geolocation Engine**: Precise mathematical distance computation between employee GPS coordinates and authorized office geofences.
- **Perimeter Radius Enforcement**: Configurable radii (e.g., 200m) with selectable policies (`Block`, `Allow with Warning`, `Manager Approval Required`).
- **Shift & Overtime Automation**: Grace periods, break duration tracking, automatic overtime calculation, and manager attendance regularization workflows.

### 3. 💰 Payroll & Statutory Compensation Engine
- **Statutory Formula Implementation**:
  $$\text{Basic Salary} = 40\% \times \text{Gross CTC}$$
  $$\text{HRA} = 20\% \times \text{Gross CTC}$$
  $$\text{Provident Fund (PF)} = 12\% \times \text{Basic Salary}$$
  $$\text{ESI} = 0.75\% \times \text{Gross CTC} \quad (\text{if Gross} \le ₹21,000)$$
  $$\text{Professional Tax (PT)} = ₹200 \quad (\text{Karnataka/State Standard})$$
- **5-Step Payroll Run Lifecycle**: Draft $\rightarrow$ Attendance Sync / LOP Calculation $\rightarrow$ Statutory Computation $\rightarrow$ Audit Review $\rightarrow$ Approval & Disbursement.
- **Dynamic PDF Payslips**: High-definition, branded payslip generation with client-side & server jsPDF rendering.

### 4. 📈 Performance Management & OKRs
- **Strategic OKRs & Goals**: Weightage allocation, due dates, milestone tracking, and progress percentage updates.
- **5-Stage 360° Review Process**: Self Review $\rightarrow$ Manager Appraisal $\rightarrow$ Peer Feedback $\rightarrow$ HR Normalization $\rightarrow$ Final Rating & Increment/Promotion recommendations.
- **Performance Distribution Analytics**: 9-box performance vs. potential matrix and top talent identification.

### 5. 🎯 Recruitment & Visual ATS
- **Job Requisitions**: Full job lifecycle management with opening counts, salary ranges, and requirement specifications.
- **Interactive Kanban Pipeline**: Drag-and-drop / stage advancement across 7 stages: *Applied $\rightarrow$ Screening $\rightarrow$ Technical $\rightarrow$ HR $\rightarrow$ Offer $\rightarrow$ Hired $\rightarrow$ Rejected*.
- **Interview Scheduling**: Integration with Google Meet / Zoom links, duration tracking, and structured interviewer scorecards.

### 6. 🌴 Leave Management & Time-Off
- **Leave Quotas**: Dynamic balance tracking for Casual Leave (CL), Earned Leave (EL), Sick Leave (SL), Maternity/Paternity, and Compensatory Offs.
- **Approval Chains**: Multi-tier approvals with instant notification triggers and holiday calendar clash detection.

### 7. 📱 Employee Self-Service (ESS)
- **Mobile-Responsive Dashboard**: Quick GPS punch-in/out, leave balance widgets, instant leave applications, personal goal updates, and one-click payslip PDF downloads.

### 8. 🧾 Expense Claims & Reimbursements
- **Claim Submission**: Category categorization (Travel, Meals, Hardware, Software, Medical), merchant details, and receipt uploads.
- **Finance Approval Pipeline**: Two-stage approval (Manager $\rightarrow$ Finance) with payment disbursal status tracking.

### 9. ❤️ Engagement & Kudos
- **Company Announcements**: Category-tagged posts (Townhall, Milestone, Policy, Celebration) with pinning and like counts.
- **Peer Recognition Badges**: Interactive recognition cards with animated kudos badges (*Team Player*, *Innovation Hero*, *Customer Champion*, *Star Performer*, *Helping Hand*) and celebration confetti.

### 10. 🔌 Integration Marketplace
- **Ecosystem Connectors**: Pre-built integration cards for Slack, Jira, GitHub, Google Workspace, Zoho Books, and Biometric fingerprint/face hardware.

### 11. 🛡️ Super Admin & Multi-Tenancy Hub
- **Organization Provisioning**: Create and manage multiple enterprise tenants, configure billing tiers (*Enterprise*, *Professional*, *Growth*), and toggle module enablement per tenant.
- **Security Verification Suite**: Run live cross-tenant database isolation checks directly from the UI.

---

## 🔒 Security & Multi-Tenant Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │           Client HTTP Request                │
                  │   Authorization: Bearer <AccessToken>        │
                  │   Cookie: refreshToken=<HttpOnlyCookie>      │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │    Express API Gateway & Security Filter     │
                  │    • Rate Limiting (500 req / 15 min)        │
                  │    • Security Headers (HSTS, CSP, X-Frame)   │
                  │    • CORS & Cookie Parsers                   │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │        JWT Authentication & RBAC Guard       │
                  │   • Verify Token Signature (15m expiry)      │
                  │   • Extract `userId`, `orgId`, `role`        │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │         TenantScopedRepository Layer         │
                  │   Enforces `WHERE orgId = req.user.orgId`    │
                  │   Rejects cross-tenant reads/writes (403)    │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │            PostgreSQL 16 Database            │
                  │   Isolated rows, foreign key constraints     │
                  └──────────────────────────────────────────────┘
```

1. **Dual-Token Authentication**:
   - Short-lived Access Token (15 minutes) signed with `JWT_SECRET`.
   - Long-lived Refresh Token (7 days) stored in PostgreSQL (`refresh_tokens` table) and issued via secure `HttpOnly`, `SameSite=Strict` cookie.
2. **Strict Application-Layer Multi-Tenancy**:
   - All Prisma queries are executed via the `TenantScopedRepository` layer which injects `orgId` boundaries on all `findMany`, `findFirst`, `create`, `update`, and `delete` operations.
   - Cross-tenant access attempts immediately trigger a `TenantIsolationError (403 Forbidden)` and log a security audit event.
3. **Cryptographic Signed File Access**:
   - File uploads and downloads use HMAC-SHA256 signed URLs with 15-minute expiration timestamps and path-traversal sanitization (`/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9]+)?$/`).
4. **Immutable Audit Trail**:
   - All critical mutations (employee creation, salary changes, payroll approvals, attendance regularization) append immutable records to the `audit_log_entries` table with user metadata and IP addresses.

---

## 🧪 Automated Test Suite

Sqbe HRMS includes a full-coverage, automated test suite in `server/tests/runAllTests.ts`. Run all test suites anytime using:

```bash
npm test
```

### Test Coverage Summary:
- **Suite 1: Authentication Security** — Password hashing round-trip, JWT claim validation, expired token rejection, tampered token signature rejection, refresh token secret separation.
- **Suite 2: Authorization & RBAC** — Super Admin universal access, Employee mutation blocking, Manager approval boundary verification.
- **Suite 3: Multi-Tenant Isolation** — Query tenant filtering, cross-tenant ID access blocking, cross-tenant mutation rejection.
- **Suite 4: Attendance & Geofencing** — Haversine distance accuracy (0m at coordinates), perimeter radius verification (within 200m), out-of-bounds rejection, invalid coordinate handling, duration calculation.
- **Suite 5: Payroll Security & Math** — Basic (40%), PF (12%), ESI, PT, and Net Salary mathematical consistency; payslip employee isolation.
- **Suite 6: File Storage & Signed URLs** — HMAC-SHA256 signature generation, signature verification, tampered tenant rejection, expired URL rejection, path traversal protection.
- **Suite 7: Leave Workflows** — State transitions (Pending $\rightarrow$ Approved / Rejected).
- **Suite 8: Performance & OKR Workflows** — Goal completion triggers, 5-stage review progression.
- **Suite 9: Recruitment & ATS Workflows** — Multi-stage candidate advancement, interview scheduling.
- **Suite 10: Audit Logging** — Generator verification across all 13 critical lifecycle events.

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `tsx server.ts` | Runs the full-stack server (Express API + Vite HMR) in development mode |
| `npm run build` | `vite build && esbuild ...` | Builds frontend assets to `dist/` and bundles `server.cjs` |
| `npm run start` | `node dist/server.cjs` | Launches the production compiled server |
| `npm run test` | `tsx server/tests/runAllTests.ts` | Executes the complete automated test suite |
| `npm run db:generate` | `prisma generate` | Generates the typed Prisma Client |
| `npm run db:push` | `prisma db push` | Pushes schema changes directly to the PostgreSQL database |
| `npm run db:migrate` | `prisma migrate dev` | Creates and applies Prisma database migrations |
| `npm run db:seed` | `tsx server/db/seed.ts` | Seeds PostgreSQL with demo organizations, employees, and users |
| `npm run db:studio` | `prisma studio` | Opens Prisma visual database management GUI in browser |
| `npm run lint` | `tsc --noEmit` | Runs TypeScript type checking across the codebase |

---

## 📚 Complete Technical Documentation

For the complete, in-depth architectural guide, full REST API v1 specification, database schema mappings, statutory calculation formulas, and production deployment guide, please refer to:

👉 **[docs.md — Sqbe HRMS Comprehensive Technical Specification](./docs.md)**

---

## 📄 License & Intellectual Property

This project is licensed under the **Proprietary Enterprise License** for Sqbe HRMS. All rights reserved. Designed and developed with modern enterprise standards.
