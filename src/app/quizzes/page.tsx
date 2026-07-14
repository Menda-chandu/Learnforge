import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type QuizzesPageProps = {
  searchParams: Promise<{ query?: string; page?: string }>;
};

const ITEMS_PER_PAGE = 6;

export default async function QuizzesPage({ searchParams }: QuizzesPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Await searchParams as required in Next.js 15
  const params = await searchParams;
  const query = params?.query || "";
  const currentPage = Number(params?.page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [quizzes, totalQuizzes] = await Promise.all([
    prisma.quiz.findMany({
      where: {
        createdBy: session.user.id,
        title: {
          contains: query,
        },
      },
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.quiz.count({
      where: {
        createdBy: session.user.id,
        title: {
          contains: query,
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalQuizzes / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Quizzes</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your created quizzes.</p>
        </div>
        <Link href="/quizzes/new" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 px-2.5">
          <Plus className="mr-2 h-5 w-5" />
          Create Quiz
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
        <form className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="query"
            type="search"
            placeholder="Search quizzes..."
            className="pl-8 bg-background"
            defaultValue={query}
          />
        </form>
        <div className="text-sm text-muted-foreground font-medium">
          Showing {quizzes.length} of {totalQuizzes} quizzes
        </div>
      </div>

      <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading quizzes...</div>}>
        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 rounded-xl bg-card">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {query
                ? "No quizzes matched your search query. Try a different term."
                : "You haven't created any quizzes yet. Get started by creating your first quiz!"}
            </p>
            {!query && (
              <Link href="/quizzes/new" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </Suspense>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          {currentPage > 1 ? (
            <Link href={`/quizzes?page=${currentPage - 1}${query ? `&query=${query}` : ""}`} className="inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-8 gap-1.5 px-2.5">
              Previous
            </Link>
          ) : (
            <button disabled className="inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 border-border bg-background h-8 gap-1.5 px-2.5">
              Previous
            </button>
          )}
          <div className="text-sm font-medium mx-4">
            Page {currentPage} of {totalPages}
          </div>
          {currentPage < totalPages ? (
            <Link href={`/quizzes?page=${currentPage + 1}${query ? `&query=${query}` : ""}`} className="inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-8 gap-1.5 px-2.5">
              Next
            </Link>
          ) : (
            <button disabled className="inline-flex shrink-0 items-center justify-center rounded-lg border text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 border-border bg-background h-8 gap-1.5 px-2.5">
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
