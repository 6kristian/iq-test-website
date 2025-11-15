# Quick Start Guide

Get your IQ Test application running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Create database and tables
npm run db:push
```

## Step 3: Start Development Server

```bash
npm run dev
```

## Step 4: Open in Browser

Navigate to: **http://localhost:3000**

## That's It! 🎉

You should now see the beautiful landing page. Click "Start Your IQ Test" to begin!

---

## Troubleshooting

### Database Errors
If you see Prisma errors:
1. Make sure you ran `npm run db:generate` and `npm run db:push`
2. Check that `.env` file exists with `DATABASE_URL="file:./dev.db"`

### Port Already in Use
If port 3000 is taken:
- Kill the process: `npx kill-port 3000`
- Or use a different port: `PORT=3001 npm run dev`

### Module Not Found
If you see module errors:
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

---

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Customize questions in `data/questions.json`
- Deploy to Vercel for production use

