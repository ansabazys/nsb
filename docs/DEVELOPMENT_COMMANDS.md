# NSB Development Commands

This document summarizes the development and verification commands for the NSB project.

---

## 1. Development

Start the Next.js local development server:
```bash
pnpm dev
```
By default, the server runs on [http://localhost:3000](http://localhost:3000).

---

## 2. Testing & Verification

Run the automated verification suite (business logic, calculations, schemas):
```bash
pnpm test
```

Perform strict TypeScript type-checking without emitting files:
```bash
pnpm typecheck
```

Run Next.js ESLint linting:
```bash
pnpm lint
```

---

## 3. Production Build

Create an optimized production bundle:
```bash
pnpm build
```

Start the production server locally:
```bash
pnpm start
```

---

## 4. Database & Seeding

Seed the database with sample domain entities:
```bash
pnpm seed
```
