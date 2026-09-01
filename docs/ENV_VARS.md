# Environment Variables Configuration

This document lists all environment variables required for running and deploying **NSB**.

---

## 1. Required Variables

| Variable Name | Environment | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | The REST API and Auth URL of your Supabase project. | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | The public anonymous key for Supabase API requests. Subject to Row Level Security (RLS). | `eyJhbGciOiJIUzI1Ni...` |

---

## 2. Server-Only Variables

> [!CAUTION]
> Never expose these keys to client-side code or commit them to version control.

| Variable Name | Environment | Description | Example |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | Admin key that bypasses Row Level Security. Used only for database migrations, background jobs, and seed scripts. | `eyJhbGciOiJIUzI1Ni...` |

---

## 3. Application Variables

| Variable Name | Environment | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Client & Server | `http://localhost:3000` | The public root URL of the application. |
| `NODE_ENV` | Client & Server | `development` | `development`, `test`, or `production` |

---

## 4. Local Setup Instructions

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the credentials from your Supabase project dashboard (**Project Settings -> API**).
