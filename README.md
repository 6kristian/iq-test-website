# IQ Test Web Application

A modern, production-ready IQ test web application built with Next.js, TypeScript, Tailwind CSS, and Prisma. Features timed tests, auto-scoring, percentile rankings, category analysis, PDF export, and anti-cheat measures.

## Features

### Core Functionality
- ✅ **Timed IQ Test** with 30-40 questions per session
- ✅ **Multiple Question Types**: Pattern recognition, logic sequences, spatial reasoning, math reasoning, and memory questions
- ✅ **Auto-Scoring System** based on correct answers and time
- ✅ **IQ Score & Percentile** display with detailed breakdown
- ✅ **Local Storage** for saving test results
- ✅ **PDF Download** functionality for results
- ✅ **Progress Bar** during the test
- ✅ **No Back Navigation** - prevents skipping back to previous questions
- ✅ **Randomized Question Order** on each attempt

### UI/UX Features
- ✅ **Modern Gradient Design** (blue/purple theme)
- ✅ **Smooth Animations** using Framer Motion
- ✅ **Mobile Responsive** layout
- ✅ **Category Analysis** showing strengths and weaknesses
- ✅ **Hero Landing Page** with animated elements

### Anti-Cheat Features
- ✅ **Right-Click Disabled** during test
- ✅ **Copy/Paste Disabled** during test
- ✅ **Tab Switch Detection** with warnings
- ✅ **Developer Tools Blocked** (F12, Ctrl+Shift+I, etc.)
- ✅ **Window Focus Detection**

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Prisma ORM with SQLite (local) / PostgreSQL (production)
- **PDF Generation**: jsPDF
- **Deployment**: Vercel (recommended)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── questions/          # Question API routes
│   │   └── results/            # Results API routes
│   ├── test/                   # Test page
│   ├── results/                # Results page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── data/
│   └── questions.json          # 100 IQ test questions
├── lib/
│   ├── prisma.ts               # Prisma client
│   └── scoring.ts              # Scoring algorithm
├── prisma/
│   └── schema.prisma           # Database schema
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository** (or navigate to the project directory)

```bash
cd "iq test website"
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the database**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates SQLite database)
npm run db:push
```

4. **Create environment file**

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Database Schema

### TestResult
- `id`: Unique identifier
- `score`: IQ estimate score
- `percentile`: Percentile ranking
- `totalQuestions`: Total questions in test
- `correctAnswers`: Number of correct answers
- `timeSpent`: Time taken in seconds
- `categoryScores`: JSON object with category breakdown
- `createdAt`: Timestamp

### Question (stored in JSON, can be migrated to DB)
- `id`: Question identifier
- `type`: Question type (pattern, logic, spatial, math, memory)
- `question`: Question text
- `options`: Array of answer options
- `correctAnswer`: Index of correct answer
- `difficulty`: Difficulty level (easy, medium, hard)
- `explanation`: Explanation of the answer

## API Routes

### Questions
- `GET /api/questions?count=35&seed=xyz` - Get randomized questions
- `GET /api/questions/[id]` - Get single question

### Results
- `POST /api/results` - Submit test results
- `GET /api/results?userId=xyz` - Get user's results
- `GET /api/results/[id]` - Get specific result

## Scoring Algorithm

The scoring system:
1. Calculates raw score (percentage of correct answers)
2. Converts to IQ estimate using conversion table
3. Calculates percentile ranking
4. Breaks down performance by category

IQ scores are estimated based on:
- Raw score percentage
- Time taken (future enhancement)
- Question difficulty (future enhancement)

## Deployment

### Vercel (Recommended)

**Important**: SQLite does NOT work on Vercel (serverless functions). You MUST use PostgreSQL or another cloud database.

1. **Set up a Database**
   - Use [Vercel Postgres](https://vercel.com/storage/postgres) (recommended)
   - Or use [Supabase](https://supabase.com), [Neon](https://neon.tech), or [PlanetScale](https://planetscale.com)
   - Get your connection string (e.g., `postgresql://user:pass@host:5432/dbname`)

2. **Update Prisma Schema**
   - Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`
   - Update `DATABASE_URL` format

3. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

4. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variable: `DATABASE_URL` (your PostgreSQL connection string)
   - The build will automatically run `prisma generate` (via postinstall script)
   - Deploy!

5. **Run Migrations**
   - After first deployment, you may need to run migrations
   - Use Vercel CLI: `vercel env pull` then `npx prisma db push`
   - Or use Prisma Migrate: `npx prisma migrate deploy`

### Other Platforms

**Netlify:**
- Similar to Vercel, supports Next.js
- Add build command: `npm run build`
- Add publish directory: `.next`

**Railway/Render:**
- Good for full-stack deployments
- Supports PostgreSQL
- Set `DATABASE_URL` environment variable

## Customization

### Changing Question Count
Edit `app/test/page.tsx`:
```typescript
const count = 35 // Change this number
```

### Adjusting Time Limit
Edit `app/test/page.tsx`:
```typescript
const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60) // 30 minutes
```

### Modifying Scoring
Edit `lib/scoring.ts` to adjust IQ conversion tables and percentile calculations.

### Adding Questions
Add questions to `data/questions.json` following the existing format.

## Security Considerations

- Anti-cheat measures are client-side and can be bypassed by determined users
- For production, consider server-side validation
- Rate limiting should be added to API routes
- Consider implementing user authentication for result tracking

## Future Enhancements

- [ ] User authentication system
- [ ] Result history and comparison
- [ ] More sophisticated scoring algorithm
- [ ] Question images for pattern/spatial questions
- [ ] Admin panel for question management
- [ ] Social sharing of results
- [ ] Detailed analytics dashboard
- [ ] Multi-language support

## License

This project is open source and available for personal and commercial use.

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using Next.js and TypeScript**

