# Learnforge 🚀

Learnforge is an AI-powered study platform designed to streamline your learning process. Import notes directly from Notion to automatically generate interactive quizzes and study decks, track your progress on a centralized dashboard, and master concepts using spaced-repetition style flashcards.

## Key Features

- **🎓 Interactive Quizzes**: Create comprehensive assessments or generate them from imported text files and Notion notes.
- **🎴 Flashcard Decks**: Build custom flashcard sets. Features a sleek 3D flipping card study interface to track what you've mastered and what you need to review.
- **📓 Notion Integration**: Seamlessly connect your Notion workspace. Pull paragraph text and bullet points to parse them into flashcards or quizzes instantly.
- **🔒 Secure Authentication**: Robust user registration, sign-in, and session management powered by Auth.js.
- **📊 Unified Dashboard**: Track study stats, recent quizzes, and recently reviewed decks at a glance.
- **🌓 Dark Mode**: Fully responsive, gorgeous interface styled with TailwindCSS and supporting native system preferences.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite
- **Auth**: [Auth.js (NextAuth.js v5)](https://authjs.dev/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & Radix UI
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Getting Started

### Prerequisites

Ensure you have Node.js installed. We recommend Node.js `v22` (or matching your system's configuration).

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (or update the existing one):

```env
# Database connection (automatically configured for local dev)
DATABASE_URL="file:./dev.db"

# Next Auth Secret (generate with `openssl rand -base64 32`)
AUTH_SECRET="your-auth-secret-here"

# Notion API Key (optional - needed for Notion integration)
# Create a token at https://www.notion.so/my-integrations
NOTION_API_KEY="secret_your_token_here"
```

### 3. Setup the Database

Generate the Prisma client and apply the database schema:

```bash
npx prisma db push
```

*(Optional)* Seed the database with a default user and sample quiz:
```bash
npx prisma db seed
```
> Default Admin Credentials:
> - **Email**: `admin@learnforge.com`
> - **Password**: `password123`

### 4. Run the Development Server

```bash
npm run dev -- -p 5015
```

Open [http://localhost:5015](http://localhost:5015) in your browser to start studying!

---

## Notion Setup Instructions

To import quizzes and flashcard decks from your Notion workspace:

1. Create a new Internal Integration at [Notion My Integrations](https://www.notion.so/my-integrations).
2. Copy the **Internal Integration Token** and save it in `.env` as `NOTION_API_KEY`.
3. Open the Notion page you wish to import, click the `...` menu in the top right, navigate to **Connect to**, search for your integration, and invite it.
4. Paste the Notion Page link directly into Learnforge to fetch and parse the text automatically.
