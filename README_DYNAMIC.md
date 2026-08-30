# Dynamic Invoices - README

This branch implements the initial database schema and server actions for a dynamic invoicing app.

Setup (local)
1. Copy .env.example to .env and set DATABASE_URL (example: file:./dev.db)
2. Install dependencies: npm install
3. Generate Prisma client + migrate:
   - npx prisma generate
   - npx prisma db push
4. Seed data (optional): node prisma/seed.ts
5. Run dev server: npm run dev

Notes
- This is an MVP starting point: CRUD actions live under src/actions/*.ts and Prisma client is at src/lib/prisma.ts
- Next steps: UI pages for customers/items/invoices, authentication, server-side PDF rendering, and admin settings.
