# Deployment Guide

## Fixing Prisma Client Error on Vercel

If you see the error: `@prisma/client did not initialize yet. Please run "prisma generate"`

### Solution

The `package.json` has been updated with:
1. **postinstall script**: Automatically runs `prisma generate` after `npm install`
2. **build script**: Runs `prisma generate` before building
3. **prisma in dependencies**: Ensures Prisma is available in production

### For Vercel Deployment

**CRITICAL**: SQLite does NOT work on Vercel serverless functions. You MUST use PostgreSQL.

#### Step 1: Update Prisma Schema for PostgreSQL

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

#### Step 2: Get a PostgreSQL Database

Options:
- **Vercel Postgres** (easiest): https://vercel.com/storage/postgres
- **Supabase**: https://supabase.com (free tier available)
- **Neon**: https://neon.tech (free tier available)
- **PlanetScale**: https://planetscale.com (MySQL, but works with Prisma)

#### Step 3: Set Environment Variable

In Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add `DATABASE_URL` with your PostgreSQL connection string
   - Format: `postgresql://user:password@host:5432/database?sslmode=require`

#### Step 4: Deploy

1. Push your code to GitHub
2. Connect to Vercel
3. Vercel will automatically:
   - Run `npm install` (which triggers `postinstall` → `prisma generate`)
   - Run `npm run build` (which also runs `prisma generate`)
   - Deploy your app

#### Step 5: Run Database Migrations

After first deployment:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
npx prisma db push

# Option 2: Using Prisma Migrate (recommended for production)
npx prisma migrate dev --name init
npx prisma migrate deploy
```

### Alternative: Use Vercel Postgres

If using Vercel Postgres:

1. In Vercel dashboard, go to Storage → Create Database → Postgres
2. Vercel automatically creates `POSTGRES_URL` environment variable
3. Update your `.env` to use it:
   ```env
   DATABASE_URL="${POSTGRES_URL}"
   ```
4. Or update `prisma/schema.prisma` to use `POSTGRES_URL` directly

### Build Command (Already Configured)

The `vercel.json` file includes:
```json
{
  "buildCommand": "prisma generate && npm run build"
}
```

This ensures Prisma client is generated before building.

### Troubleshooting

**Error: "Prisma Client did not initialize"**
- ✅ Check that `prisma generate` runs during build
- ✅ Verify `DATABASE_URL` is set in Vercel
- ✅ Check build logs for Prisma generation

**Error: "Can't reach database server"**
- ✅ Verify `DATABASE_URL` is correct
- ✅ Check database allows connections from Vercel IPs
- ✅ Ensure SSL is enabled (add `?sslmode=require` to connection string)

**Error: "Migration failed"**
- ✅ Run `npx prisma migrate reset` locally first
- ✅ Then run `npx prisma migrate deploy` in production

### Local Development

For local development with SQLite:

```bash
# .env.local
DATABASE_URL="file:./dev.db"

# Generate client and create database
npm run db:generate
npm run db:push
```

### Production Checklist

- [ ] Changed `provider = "postgresql"` in `prisma/schema.prisma`
- [ ] Set `DATABASE_URL` environment variable in Vercel
- [ ] Database is accessible from Vercel
- [ ] Ran migrations after first deployment
- [ ] Tested API routes work correctly

---

**Need Help?** Check the [Vercel Prisma Guide](https://vercel.com/guides/using-prisma-on-vercel) or [Prisma Deployment Docs](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

