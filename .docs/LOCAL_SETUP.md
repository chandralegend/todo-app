# Local Development Setup

This document outlines how to set up the project locally for development.

## Prerequisites

- Node.js 20+
- Bun or npm
- Docker (for PostgreSQL)

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts a PostgreSQL container on port 5432 with:
- Database: `todo_app`
- User: `todo_user`
- Password: `todo_password`

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://todo_user:todo_password@localhost:5432/todo_app?schema=public"

# Auth
AUTH_SECRET="your-secret-key-change-in-production"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"
```

## Docker Commands

```bash
# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down

# View logs
docker compose logs -f postgres

# Reset database (deletes all data)
docker compose down -v
docker compose up -d
```

## Common Issues

### Prisma Client Errors

If you encounter Prisma client errors, regenerate:

```bash
npx prisma generate
```

### Database Connection Issues

Ensure PostgreSQL is running:

```bash
docker ps | grep postgres
```

### Migration Issues

To reset and reapply migrations:

```bash
npx prisma migrate reset
```
